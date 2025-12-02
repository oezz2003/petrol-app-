import { Colors } from '@/constants/Colors';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
}) => {
    const buttonStyle: ViewStyle = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
    ].filter(Boolean) as ViewStyle[];

    const textStyle: TextStyle = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
    ].filter(Boolean) as TextStyle[];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? Colors.light.tint : '#FFFFFF'}
                    size="small"
                />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    // Variants
    primary: {
        backgroundColor: Colors.light.tint,
    },
    secondary: {
        backgroundColor: '#6C757D',
    },
    danger: {
        backgroundColor: Colors.light.danger,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.light.tint,
    },

    // Sizes
    size_small: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        minHeight: 32,
    },
    size_medium: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        minHeight: 44,
    },
    size_large: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        minHeight: 56,
    },

    // Disabled state
    disabled: {
        opacity: 0.5,
    },

    // Text styles
    text: {
        fontWeight: '600',
    },
    text_primary: {
        color: '#FFFFFF',
    },
    text_secondary: {
        color: '#FFFFFF',
    },
    text_danger: {
        color: '#FFFFFF',
    },
    text_outline: {
        color: Colors.light.tint,
    },
    text_small: {
        fontSize: 14,
    },
    text_medium: {
        fontSize: 16,
    },
    text_large: {
        fontSize: 18,
    },
});
