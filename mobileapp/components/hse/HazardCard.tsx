import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/Colors';
import { Hazard } from '@/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HazardCardProps {
    hazard: Hazard;
    onPress: () => void;
}

export const HazardCard: React.FC<HazardCardProps> = ({ hazard, onPress }) => {
    const hasPhotos = hazard.beforePhoto || hazard.afterPhoto;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card>
                <View style={styles.header}>
                    <Text style={styles.subject} numberOfLines={1}>
                        {hazard.subject}
                    </Text>
                    <StatusBadge status={hazard.priority} />
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {hazard.description}
                </Text>

                <Text style={styles.location}>📍 {hazard.location}</Text>

                <View style={styles.footer}>
                    <StatusBadge status={hazard.status} />
                    {hasPhotos && (
                        <View style={styles.photoIndicators}>
                            {hazard.beforePhoto && <Text style={styles.photoIcon}>📷 Before</Text>}
                            {hazard.afterPhoto && <Text style={styles.photoIcon}>📷 After</Text>}
                        </View>
                    )}
                </View>

                <Text style={styles.date}>
                    Created: {hazard.createdAt.toLocaleDateString()}
                </Text>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    subject: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        flex: 1,
    },
    description: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 8,
    },
    location: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    photoIndicators: {
        flexDirection: 'row',
        gap: 8,
    },
    photoIcon: {
        fontSize: 12,
        color: Colors.light.tint,
    },
    date: {
        fontSize: 12,
        color: Colors.light.icon,
    },
});
