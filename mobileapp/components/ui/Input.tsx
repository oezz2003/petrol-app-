import { Colors } from '@/constants/Colors';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    required?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    required = false,
    ...textInputProps
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={Colors.light.icon}
                {...textInputProps}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 6,
    },
    required: {
        color: Colors.light.danger,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.light.text,
        minHeight: 44,
    },
    inputError: {
        borderColor: Colors.light.danger,
    },
    errorText: {
        fontSize: 12,
        color: Colors.light.danger,
        marginTop: 4,
    },
});
