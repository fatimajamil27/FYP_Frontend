import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';

import RiskBar from '../components/RiskBar';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#0c0c0c",
  backgroundGradientTo: "#0c0c0c",
  color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`,
  labelColor: () => "#fff",
  decimalPlaces: 2,
};

const truncate = (s, n = 18) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s);

export default function ReportScreen({ route }) {
  const [activeTab, setActiveTab] = useState('graphs');
  const [comparisonItems, setComparisonItems] = useState([]);
  const [comparisonSummary, setComparisonSummary] = useState({});
  const [llmSummary, setLlmSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const [idealBiomechanics, setIdealBiomechanics] = useState({});

  const sanitizeAndNormalize = (raw) => {
    if (!raw) return { items: [], summary: {} };

    // The backend returns { items: [...], summary: {...} } for each view
    // So raw is that object.
    const items = raw.items || [];
    const summary = raw.summary || {};

    const normalized = items.map((it, idx) => {
      const view = typeof it.view === "string" ? it.view : "front";

      const feature = (it.feature || it.Feature || `feat_${idx}`).toString();

      const uploadedRaw = it.uploaded ?? it.Uploaded ?? it.Average ?? null;
      const referenceRaw = it.reference ?? it.Reference ?? it.ref ?? null;
      const idealMinRaw = it.ideal_min ?? null;
      const idealMaxRaw = it.ideal_max ?? null;

      const uploadedNum =
        typeof uploadedRaw === "number"
          ? uploadedRaw
          : uploadedRaw != null && !Number.isNaN(Number(uploadedRaw))
            ? Number(uploadedRaw)
            : null;

      const referenceNum =
        typeof referenceRaw === "number"
          ? referenceRaw
          : referenceRaw != null && !Number.isNaN(Number(referenceRaw))
            ? Number(referenceRaw)
            : null;

      const idealMinNum =
        typeof idealMinRaw === "number" ? idealMinRaw : null;
      const idealMaxNum =
        typeof idealMaxRaw === "number" ? idealMaxRaw : null;

      return {
        view,
        feature,
        uploaded: uploadedNum,
        reference: referenceNum,
        ideal_min: idealMinNum,
        ideal_max: idealMaxNum,
        uploadedForChart: Number.isFinite(uploadedNum) ? uploadedNum : 0,
        referenceForChart: Number.isFinite(referenceNum) ? referenceNum : 0,
        pct_diff: it.pct_diff ?? it.pctDiff ?? null,
        difference: it.difference ?? null,
        zscore: it.zscore ?? null,
        flag: it.flag || "ok",
        units: it.units || ""
      };
    });

    return { items: normalized, summary };
  };

  const fetchAll = async () => {
    if (!refreshing) setLoading(true);

    try {
      const username = await AsyncStorage.getItem("username") || "anonymous";

      let res;
      // Always fetch latest report by username as requested
      res = await axios.get(`${BASE_URL}/get-latest-report`, {
        params: { username }
      });

      let data = res.data;
      // Robustness: if axios didn't parse JSON automatically (e.g. due to NaN)
      if (typeof data === 'string') {
        try {
          // Python's json.dumps can produce NaN, which is invalid JSON.
          // Replace NaN with null to make it valid.
          const fixedData = data.replace(/NaN/g, "null");
          data = JSON.parse(fixedData);
        } catch (e) {
          console.error("Failed to parse response data", e);
        }
      }

      if (!data?.success || !data?.report) {
        setComparisonItems([]);
        setComparisonSummary({});
        setLlmSummary("");
        setIdealBiomechanics({});
        return;
      }

      const report = data.report;

      // Set ideal biomechanics if available
      if (data.ideal_biomechanics) {
        setIdealBiomechanics(data.ideal_biomechanics);
      }

      // ------------------------------
      // FINAL FIX: parse comparison_report by view
      // ------------------------------
      const cmpObj = report.comparison_report ?? {};

      let allItems = [];
      let summaryByView = {};

      // Check if cmpObj is the old "flat" structure (has .items array directly)
      // or the new structure (keys are views like "front", "side", "back")
      const isFlat = Array.isArray(cmpObj.items);

      if (isFlat) {
        // Handle flat structure
        const { items, summary } = sanitizeAndNormalize(cmpObj);
        // If items have a 'view' property, use it; otherwise default to 'front' or 'unknown'
        const tagged = items.map((x) => ({ ...x, view: x.view || "front" }));
        allItems.push(...tagged);
        summaryByView["combined"] = summary || {};
      } else {
        // Handle keyed structure (front, side, back)
        Object.keys(cmpObj).forEach((view) => {
          const viewData = cmpObj[view];
          if (!viewData) return;

          const { items, summary } = sanitizeAndNormalize(viewData);

          const tagged = items.map((x) => ({ ...x, view }));
          allItems.push(...tagged);

          summaryByView[view] = summary || {};
        });
      }

      setComparisonItems(allItems);
      setComparisonSummary(summaryByView);
      setLlmSummary(report.llm_summary || "");
    } catch (err) {
      console.log("fetchAll error:", err);
      Alert.alert("Error", "Failed to fetch report. Check backend.");
      setComparisonItems([]);
      setComparisonSummary({});
      setLlmSummary("");
      setIdealBiomechanics({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const views = ["front", "side", "back"];

  const renderIdealTable = () => {
    if (!idealBiomechanics || Object.keys(idealBiomechanics).length === 0) return null;

    // Get unique feature names from the comparison items
    const extractedFeatures = new Set(comparisonItems.map(item => item.feature));

    // Filter ideal biomechanics to only show parameters that are in the extracted features
    // We need to match the parameter names from CSV with the feature names in the report
    const filteredIdealBiomechanics = Object.entries(idealBiomechanics).filter(([param, details]) => {
      // Check if this parameter matches any extracted feature
      // The feature names might be slightly different, so we'll do a flexible match
      const paramLower = param.toLowerCase().replace(/[^a-z0-9]/g, '');

      return Array.from(extractedFeatures).some(feature => {
        const featureLower = feature.toLowerCase().replace(/[^a-z0-9]/g, '');
        // Check if they match or if one contains the other
        return paramLower.includes(featureLower) || featureLower.includes(paramLower);
      });
    });

    // If no matching parameters found, don't show the table
    if (filteredIdealBiomechanics.length === 0) return null;

    return (
      <View style={{ margin: 16, backgroundColor: "#1a1a1a", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#333" }}>
        <Text style={{ color: "#FF6600", fontSize: 16, fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>
          IDEAL BIOMECHANICAL RANGES
        </Text>

        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#444', paddingBottom: 8, marginBottom: 8 }}>
          <Text style={{ flex: 2, color: '#aaa', fontSize: 12, fontWeight: 'bold' }}>Parameter</Text>
          <Text style={{ flex: 1, color: '#aaa', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>Range</Text>
          <Text style={{ flex: 1, color: '#aaa', fontSize: 12, fontWeight: 'bold', textAlign: 'right' }}>Unit</Text>
        </View>

        {filteredIdealBiomechanics.map(([param, details], idx) => (
          <View key={idx} style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#222' }}>
            <Text style={{ flex: 2, color: '#fff', fontSize: 12 }}>{param}</Text>
            <Text style={{ flex: 1, color: '#4CAF50', fontSize: 12, textAlign: 'center' }}>
              {details.min !== null ? details.min : '?'} - {details.max !== null ? details.max : '?'}
            </Text>
            <Text style={{ flex: 1, color: '#888', fontSize: 12, textAlign: 'right' }}>{details.units}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderAnalysisContent = () => {
    if (!comparisonItems.length) {
      return (
        <View style={{ padding: 20 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>No data available</Text>
        </View>
      );
    }

    // Dynamically get views from data to avoid mismatches
    const dynamicViews = [...new Set(comparisonItems.map(i => i.view))];
    const viewsToRender = dynamicViews.length > 0 ? dynamicViews : views;

    return (

      <View style={{ padding: 16 }}>
        {/* Analysis Section with RiskBars */}
        <View style={{ marginTop: 8, backgroundColor: "#111", padding: 12, borderRadius: 8 }}>
          <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 12 }}>BIOMECHANICAL ANALYSIS</Text>

          {comparisonItems.map((i, idx) => (
            <View key={i.feature + idx} style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 8 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{i.feature}</Text>
              <RiskBar
                value={i.uploaded}
                idealMin={i.ideal_min}
                idealMax={i.ideal_max}
                units={i.units}
              />
            </View>
          ))}
        </View>
        {comparisonItems.some((d) => !Number.isFinite(d.ideal_min) && !Number.isFinite(d.reference)) && (
          <Text style={{ color: "#ffcc00", marginTop: 8, fontSize: 12 }}>
            Note: some features have no ideal range or reference value.
          </Text>
        )}
      </View>
    );
  };

  const renderSummaryContent = () => {
    const available = Object.keys(comparisonSummary).length > 0;

    if (!llmSummary && !available) {
      return (
        <Text style={{ color: "#fff", padding: 20 }}>
          LLM summary is still generating. Pull to refresh.
        </Text>
      );
    }

    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "#FF6600", fontSize: 18, marginBottom: 8 }}>🤖 AI Summary</Text>

        {llmSummary ? (
          <View style={{ marginBottom: 16 }}>
            {llmSummary.split('\n').map((line, index) => {
              const trimmed = line.trim();
              // Check if line is a heading (uppercase and ends with colon)
              // The prompt asks for "UPPERCASE followed by a colon", e.g. "SUMMARY:"
              // We can be a bit flexible: if it ends with ':' and is mostly uppercase or short.
              const isHeading = trimmed.length > 0 && trimmed.endsWith(':') && trimmed === trimmed.toUpperCase();

              if (isHeading) {
                return (
                  <Text key={index} style={{ color: "#FF6600", fontWeight: "bold", marginTop: 12, marginBottom: 4, fontSize: 16 }}>
                    {trimmed}
                  </Text>
                );
              }

              // Regular text
              return (
                <Text key={index} style={{ color: "#fff", marginBottom: 2, lineHeight: 20 }}>
                  {line}
                </Text>
              );
            })}
          </View>
        ) : (
          <View style={{ backgroundColor: "#111", padding: 12, borderRadius: 8 }}>
            <Text style={{ color: "#fff", marginBottom: 8 }}>Auto summary (computed):</Text>
            {Object.keys(comparisonSummary).map((view) => (
              <View key={view} style={{ marginBottom: 8 }}>
                <Text style={{ color: "#FF6600", fontWeight: "700", marginBottom: 6 }}>
                  {view.toUpperCase()}
                </Text>
                <Text style={{ color: "#ddd" }}>Score: {comparisonSummary[view].score ?? "N/A"}</Text>
                <Text style={{ color: "#ddd" }}>
                  Compared: {comparisonSummary[view].total_compared ?? 0} • Flagged:{" "}
                  {comparisonSummary[view].flagged_count ?? 0}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTabs = () => (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333' }}>
      <TouchableOpacity
        style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: activeTab === 'graphs' ? 2 : 0, borderBottomColor: '#FF6600' }}
        onPress={() => setActiveTab('graphs')}
      >
        <Text style={{ color: activeTab === 'graphs' ? '#FF6600' : '#888', fontWeight: 'bold', fontSize: 16 }}>GRAPHS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: activeTab === 'summary' ? 2 : 0, borderBottomColor: '#FF6600' }}
        onPress={() => setActiveTab('summary')}
      >
        <Text style={{ color: activeTab === 'summary' ? '#FF6600' : '#888', fontWeight: 'bold', fontSize: 16 }}>SUMMARY</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#FF6600"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0c0c0c", paddingTop: 40 }}>
      {renderTabs()}
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {activeTab === 'graphs' ? (
          <>
            {renderIdealTable()}
            {renderAnalysisContent()}
          </>
        ) : (
          renderSummaryContent()
        )}
      </ScrollView>
    </View>
  );
}
