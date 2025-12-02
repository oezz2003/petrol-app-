import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, noPadding = false }) => {
    return (
        <View style={[styles.card, noPadding && styles.noPadding, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noPadding: {
        padding: 0,
    },
});
