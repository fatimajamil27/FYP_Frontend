
// Mock data from backend log
const mockReport = {
    comparison_report: {
        front: {
            items: [
                { feature: "Elbow Angle", uploaded: 150, reference: 160, ideal_min: 140, ideal_max: 180 },
                { feature: "Knee Flexion", uploaded: 30, reference: 25, ideal_min: 20, ideal_max: 40 },
                { feature: "Trunk Lean", uploaded: 10, reference: 12, ideal_min: 5, ideal_max: 15 }
            ],
            summary: { score: 85, total_compared: 3, flagged_count: 0 }
        },
        side: {
            items: [
                { feature: "Step Length", uploaded: 1.2, reference: 1.1, ideal_min: 1.0, ideal_max: 1.3 },
                // ... more items
            ],
            summary: { score: 90, total_compared: 1, flagged_count: 0 }
        },
        back: {
            items: [
                { feature: "Shoulder Alignment", uploaded: 5, reference: 0, ideal_min: -5, ideal_max: 5 }
            ],
            summary: { score: 95, total_compared: 1, flagged_count: 0 }
        }
    }
};

// Logic from report.jsx
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

function processReport(report) {
    const cmpObj = report.comparison_report ?? {};
    console.log("🔍 DEBUG: Report received. cmpObj keys:", Object.keys(cmpObj));
    console.log("🔍 DEBUG: cmpObj raw:", JSON.stringify(cmpObj, null, 2));

    let allItems = [];
    let summaryByView = {};

    // Check if cmpObj is the old "flat" structure (has .items array directly)
    // or the new structure (keys are views like "front", "side", "back")
    const isFlat = Array.isArray(cmpObj.items);
    console.log("🔍 DEBUG: isFlat structure?", isFlat);

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

            console.log(`🔍 DEBUG: Processing view ${view}`);
            const { items, summary } = sanitizeAndNormalize(viewData);
            console.log(`🔍 DEBUG: Items for ${view}: ${items.length}`);

            const tagged = items.map((x) => ({ ...x, view }));
            allItems.push(...tagged);

            summaryByView[view] = summary || {};
        });
    }

    console.log("🔍 DEBUG: Total allItems:", allItems.length);
    return allItems;
}

const result = processReport(mockReport);
console.log("Result items:", result.length);
if (result.length > 0) {
    console.log("✅ Logic works with mock data.");
} else {
    console.log("❌ Logic failed with mock data.");
}
