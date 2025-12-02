import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressStepperProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
    currentStep,
    totalSteps,
    labels,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.stepsContainer}>
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isActive = stepNumber === currentStep;

                    return (
                        <React.Fragment key={stepNumber}>
                            <View style={styles.stepWrapper}>
                                <View
                                    style={[
                                        styles.stepCircle,
                                        isCompleted && styles.stepCompleted,
                                        isActive && styles.stepActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.stepNumber,
                                            (isCompleted || isActive) && styles.stepNumberActive,
                                        ]}
                                    >
                                        {stepNumber}
                                    </Text>
                                </View>
                                {labels && labels[index] && (
                                    <Text
                                        style={[
                                            styles.stepLabel,
                                            isActive && styles.stepLabelActive,
                                        ]}
                                    >
                                        {labels[index]}
                                    </Text>
                                )}
                            </View>
                            {stepNumber < totalSteps && (
                                <View
                                    style={[
                                        styles.connector,
                                        isCompleted && styles.connectorCompleted,
                                    ]}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
            <Text style={styles.progressText}>
                Step {currentStep} of {totalSteps}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: Colors.light.card,
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    stepWrapper: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.light.border,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.light.border,
    },
    stepCompleted: {
        backgroundColor: Colors.light.success,
        borderColor: Colors.light.success,
    },
    stepActive: {
        backgroundColor: Colors.light.tint,
        borderColor: Colors.light.tint,
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.icon,
    },
    stepNumberActive: {
        color: '#FFFFFF',
    },
    stepLabel: {
        fontSize: 10,
        color: Colors.light.icon,
        marginTop: 4,
        maxWidth: 60,
        textAlign: 'center',
    },
    stepLabelActive: {
        color: Colors.light.tint,
        fontWeight: '600',
    },
    connector: {
        flex: 1,
        height: 2,
        backgroundColor: Colors.light.border,
        marginHorizontal: 4,
    },
    connectorCompleted: {
        backgroundColor: Colors.light.success,
    },
    progressText: {
        textAlign: 'center',
        fontSize: 14,
        color: Colors.light.text,
        fontWeight: '500',
    },
});
