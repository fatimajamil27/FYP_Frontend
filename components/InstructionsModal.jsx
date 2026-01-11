import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InstructionsModal = ({ visible, onClose }) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>📋 Upload Instructions</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.instructionTitle}>Please follow these guidelines for best results:</Text>

                        <View style={styles.instructionItem}>
                            <View style={styles.bulletPoint}>
                                <Text style={styles.bulletText}>1</Text>
                            </View>
                            <Text style={styles.instructionText}>
                                <Text style={styles.bold}>Upload 3 videos</Text> from different angles: Back view, Side view, and Front view of the bowling action
                            </Text>
                        </View>

                        <View style={styles.instructionItem}>
                            <View style={styles.bulletPoint}>
                                <Text style={styles.bulletText}>2</Text>
                            </View>
                            <Text style={styles.instructionText}>
                                <Text style={styles.bold}>Video quality</Text> should be at least 1080p (Full HD) to ensure accurate pose detection and analysis
                            </Text>
                        </View>

                        <View style={styles.instructionItem}>
                            <View style={styles.bulletPoint}>
                                <Text style={styles.bulletText}>3</Text>
                            </View>
                            <Text style={styles.instructionText}>
                                <Text style={styles.bold}>Clear visibility</Text> - Ensure the bowler is clearly visible throughout the entire bowling action
                            </Text>
                        </View>

                        <View style={styles.instructionItem}>
                            <View style={styles.bulletPoint}>
                                <Text style={styles.bulletText}>4</Text>
                            </View>
                            <Text style={styles.instructionText}>
                                <Text style={styles.bold}>Good lighting</Text> - Record in well-lit conditions to improve pose estimation accuracy
                            </Text>
                        </View>

                        <View style={styles.instructionItem}>
                            <View style={styles.bulletPoint}>
                                <Text style={styles.bulletText}>5</Text>
                            </View>
                            <Text style={styles.instructionText}>
                                <Text style={styles.bold}>Stable camera</Text> - Use a tripod or stable surface to minimize camera shake
                            </Text>
                        </View>

                        <View style={styles.instructionItem}>
                            <View style={styles.bulletPoint}>
                                <Text style={styles.bulletText}>6</Text>
                            </View>
                            <Text style={styles.instructionText}>
                                <Text style={styles.bold}>Complete action</Text> - Capture the full bowling action from run-up to follow-through
                            </Text>
                        </View>

                        <View style={styles.noteBox}>
                            <Ionicons name="information-circle" size={20} color="#FF6600" />
                            <Text style={styles.noteText}>
                                Note: Uploading fewer than 3 videos may affect the accuracy of the biomechanical analysis.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer Button */}
                    <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
                        <Text style={styles.gotItButtonText}>Got It!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        width: '100%',
        maxHeight: '80%',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        padding: 20,
    },
    instructionTitle: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
        fontWeight: '600',
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FF6600',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    bulletText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#ddd',
        lineHeight: 22,
    },
    bold: {
        fontWeight: 'bold',
        color: '#fff',
    },
    noteBox: {
        flexDirection: 'row',
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6600',
        alignItems: 'center',
    },
    noteText: {
        flex: 1,
        fontSize: 12,
        color: '#ccc',
        marginLeft: 8,
        lineHeight: 18,
    },
    gotItButton: {
        backgroundColor: '#FF6600',
        margin: 20,
        marginTop: 12,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    gotItButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default InstructionsModal;
