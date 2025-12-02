import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/Colors';
import { Well } from '@/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

interface WellCardProps {
    well: Well;
    onPress: () => void;
}

export const WellCard: React.FC<WellCardProps> = ({ well, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card>
                <View style={styles.header}>
                    <Text style={styles.wellName}>{well.basicData.wellName}</Text>
                    <StatusBadge status={well.status} />
                </View>
                <Text style={styles.location}>📍 {well.basicData.location}</Text>
                <Text style={styles.rigId}>Rig: {well.basicData.rigNameId}</Text>
                <View style={styles.footer}>
                    <Text style={styles.date}>
                        Last updated: {formatDate(well.updatedAt)}
                    </Text>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    wellName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        flex: 1,
        marginRight: 8,
    },
    location: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 4,
    },
    rigId: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 8,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        paddingTop: 8,
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: Colors.light.icon,
    },
});
