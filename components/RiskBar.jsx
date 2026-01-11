import React from 'react';
import { View, Text } from 'react-native';

const RiskBar = ({ value, idealMin, idealMax, units }) => {
    // If no ideal range, we can't really show a risk bar effectively.
    if (idealMin == null || idealMax == null || value == null) {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', height: 30 }}>
                <Text style={{ color: '#aaa', fontSize: 12 }}>No ideal range available</Text>
            </View>
        );
    }

    // Calculate risk level based on absolute degree deviation
    let riskLevel = "Ideal";
    let fillColor = "#4CAF50"; // Green

    // Calculate absolute deviation from ideal range
    const deviation = value < idealMin ? idealMin - value : value > idealMax ? value - idealMax : 0;

    // Risk categories and fill percentage
    let fillPercentage = 0;

    if (deviation === 0) {
        riskLevel = "Ideal";
        fillColor = "#4CAF50";
        // Fill within ideal zone (0-25%)
        const rangeSize = idealMax - idealMin || 1;
        const valueInRange = Math.max(0, Math.min(rangeSize, value - idealMin));
        fillPercentage = (valueInRange / rangeSize) * 25;
    } else if (deviation <= 5) {
        riskLevel = "Low Risk";
        fillColor = "#FFEB3B";
        // Fill ideal zone completely (25%) + portion of low zone
        fillPercentage = 25 + (deviation / 5) * 25;
    } else if (deviation <= 10) {
        riskLevel = "Medium Risk";
        fillColor = "#FF9800";
        // Fill ideal + low zones (50%) + portion of medium zone
        fillPercentage = 50 + ((deviation - 5) / 5) * 25;
    } else {
        riskLevel = "High Risk";
        fillColor = "#F44336";
        // Fill ideal + low + medium zones (75%) + portion of high zone
        const excessDeviation = Math.min(deviation - 10, 10);
        fillPercentage = 75 + (excessDeviation / 10) * 25;
    }

    return (
        <View style={{ marginVertical: 8 }}>
            {/* Risk Level and Value */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: fillColor, fontWeight: 'bold', fontSize: 13 }}>
                    {riskLevel.toUpperCase()}
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13 }}>
                    {value.toFixed(1)} {units}
                </Text>
            </View>

            {/* Risk Bar Container */}
            <View style={{ position: 'relative' }}>
                {/* Background Bar with Zones */}
                <View style={{
                    height: 24,
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexDirection: 'row',
                    borderWidth: 2,
                    borderColor: '#555',
                    backgroundColor: '#2a2a2a'
                }}>
                    {/* Ideal Zone - Green */}
                    <View style={{
                        flex: 1,
                        backgroundColor: '#2a2a2a',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRightWidth: 1,
                        borderRightColor: '#555'
                    }}>
                        <Text style={{ color: '#666', fontSize: 8, fontWeight: 'bold' }}>IDEAL</Text>
                    </View>

                    {/* Low Risk Zone */}
                    <View style={{
                        flex: 1,
                        backgroundColor: '#2a2a2a',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRightWidth: 1,
                        borderRightColor: '#555'
                    }}>
                        <Text style={{ color: '#666', fontSize: 8, fontWeight: 'bold' }}>LOW</Text>
                    </View>

                    {/* Medium Risk Zone */}
                    <View style={{
                        flex: 1,
                        backgroundColor: '#2a2a2a',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRightWidth: 1,
                        borderRightColor: '#555'
                    }}>
                        <Text style={{ color: '#666', fontSize: 8, fontWeight: 'bold' }}>MEDIUM</Text>
                    </View>

                    {/* High Risk Zone */}
                    <View style={{
                        flex: 1,
                        backgroundColor: '#2a2a2a',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: '#666', fontSize: 8, fontWeight: 'bold' }}>HIGH</Text>
                    </View>
                </View>

                {/* Fill Overlay */}
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${fillPercentage}%`,
                        borderRadius: 12,
                        overflow: 'hidden',
                        flexDirection: 'row'
                    }}
                >
                    {/* Filled portion with gradient effect */}
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        height: '100%'
                    }}>
                        {/* Green section (0-25%) */}
                        {fillPercentage > 0 && (
                            <View style={{
                                width: `${Math.min(fillPercentage, 25) / fillPercentage * 100}%`,
                                backgroundColor: '#4CAF50',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {fillPercentage <= 25 && (
                                    <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>IDEAL</Text>
                                )}
                            </View>
                        )}

                        {/* Yellow section (25-50%) */}
                        {fillPercentage > 25 && (
                            <View style={{
                                width: `${Math.min(fillPercentage - 25, 25) / fillPercentage * 100}%`,
                                backgroundColor: '#FFEB3B',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {fillPercentage > 25 && fillPercentage <= 50 && (
                                    <Text style={{ color: '#333', fontSize: 8, fontWeight: 'bold' }}>LOW</Text>
                                )}
                            </View>
                        )}

                        {/* Orange section (50-75%) */}
                        {fillPercentage > 50 && (
                            <View style={{
                                width: `${Math.min(fillPercentage - 50, 25) / fillPercentage * 100}%`,
                                backgroundColor: '#FF9800',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {fillPercentage > 50 && fillPercentage <= 75 && (
                                    <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>MEDIUM</Text>
                                )}
                            </View>
                        )}

                        {/* Red section (75-100%) */}
                        {fillPercentage > 75 && (
                            <View style={{
                                width: `${(fillPercentage - 75) / fillPercentage * 100}%`,
                                backgroundColor: '#F44336',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {fillPercentage > 75 && (
                                    <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>HIGH</Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Ideal Range Info */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
                <Text style={{ color: '#4CAF50', fontSize: 10 }}>
                    Ideal Range: {idealMin}° - {idealMax}°
                </Text>
            </View>
        </View>
    );
};

export default RiskBar;
