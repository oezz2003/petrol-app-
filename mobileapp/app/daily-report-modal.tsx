import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/store/AppContext';
import { DailyReport, SafetyStatus } from '@/types';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DailyReportModal() {
    const { addDailyReport } = useApp();
    const [formData, setFormData] = useState({
        wellLocation: '',
        operationsSummary: '',
        safetyStatus: SafetyStatus.SAFE,
        issuesDescription: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const currentDate = new Date();

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.wellLocation.trim()) {
            newErrors.wellLocation = 'Well/Location is required';
        }
        if (!formData.operationsSummary.trim()) {
            newErrors.operationsSummary = 'Operations summary is required';
        }
        if (
            formData.safetyStatus === SafetyStatus.ISSUES &&
            !formData.issuesDescription.trim()
        ) {
            newErrors.issuesDescription = 'Please describe the safety issues';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        const report: DailyReport = {
            id: Date.now().toString(),
            ...formData,
            timestamp: currentDate,
        };

        addDailyReport(report);
        Alert.alert('Report Submitted', 'Your daily report has been submitted', [
            {
                text: 'OK',
                onPress: () => {
                    // Close modal and go back
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/(tabs)/operations');
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📋 Daily Report</Text>
                <Text style={styles.datetime}>
                    {currentDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Text>
                <Text style={styles.time}>
                    {currentDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                <Text style={styles.subtitle}>
                    This is a mandatory daily report. Please complete all fields.
                </Text>

                <Input
                    label="Well / Location"
                    value={formData.wellLocation}
                    onChangeText={(text) =>
                        setFormData({ ...formData, wellLocation: text })
                    }
                    placeholder="e.g. Well Alpha-7, Site A"
                    required
                    error={errors.wellLocation}
                />

                <Input
                    label="Summary of Operations"
                    value={formData.operationsSummary}
                    onChangeText={(text) =>
                        setFormData({ ...formData, operationsSummary: text })
                    }
                    placeholder="Describe today's operations..."
                    multiline
                    numberOfLines={5}
                    required
                    error={errors.operationsSummary}
                />

                {/* Safety Status Selector */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Safety Status <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.statusButtons}>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                formData.safetyStatus === SafetyStatus.SAFE &&
                                styles.statusButtonSafe,
                            ]}
                            onPress={() =>
                                setFormData({ ...formData, safetyStatus: SafetyStatus.SAFE })
                            }
                        >
                            <Text
                                style={[
                                    styles.statusButtonText,
                                    formData.safetyStatus === SafetyStatus.SAFE &&
                                    styles.statusButtonTextActive,
                                ]}
                            >
                                ✓ Safe
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                formData.safetyStatus === SafetyStatus.ISSUES &&
                                styles.statusButtonIssues,
                            ]}
                            onPress={() =>
                                setFormData({ ...formData, safetyStatus: SafetyStatus.ISSUES })
                            }
                        >
                            <Text
                                style={[
                                    styles.statusButtonText,
                                    formData.safetyStatus === SafetyStatus.ISSUES &&
                                    styles.statusButtonTextActive,
                                ]}
                            >
                                ⚠ Issues
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Conditional Issues Description */}
                {formData.safetyStatus === SafetyStatus.ISSUES && (
                    <Input
                        label="Describe Safety Issues"
                        value={formData.issuesDescription}
                        onChangeText={(text) =>
                            setFormData({ ...formData, issuesDescription: text })
                        }
                        placeholder="Provide details about the safety issues..."
                        multiline
                        numberOfLines={4}
                        required
                        error={errors.issuesDescription}
                    />
                )}

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        ℹ️ Note: This modal cannot be dismissed without submitting the report.
                    </Text>
                </View>
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <Button
                    title="Submit Report"
                    onPress={handleSubmit}
                    size="large"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        backgroundColor: Colors.light.tint,
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    datetime: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 8,
    },
    required: {
        color: Colors.light.danger,
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.light.border,
        backgroundColor: Colors.light.card,
        alignItems: 'center',
    },
    statusButtonSafe: {
        backgroundColor: Colors.light.success,
        borderColor: Colors.light.success,
    },
    statusButtonIssues: {
        backgroundColor: Colors.light.danger,
        borderColor: Colors.light.danger,
    },
    statusButtonText: {
        fontSize: 16,
        color: Colors.light.text,
        fontWeight: '600',
    },
    statusButtonTextActive: {
        color: '#FFFFFF',
    },
    infoBox: {
        backgroundColor: Colors.light.info + '20',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    infoText: {
        fontSize: 13,
        color: Colors.light.info,
    },
    footer: {
        padding: 16,
        backgroundColor: Colors.light.card,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
});
