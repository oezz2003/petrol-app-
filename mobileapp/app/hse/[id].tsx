import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/store/AppContext';
import { HazardStatus } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HazardDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { hazards, updateHazard } = useApp();

    const hazard = hazards.find((h) => h.id === id);

    if (!hazard) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Hazard not found</Text>
            </View>
        );
    }

    const handleStatusChange = (newStatus: HazardStatus) => {
        updateHazard(hazard.id, { status: newStatus });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
                <StatusBadge status={hazard.status} />
                <StatusBadge status={hazard.priority} />
            </View>

            <Card>
                <Text style={styles.sectionTitle}>Subject</Text>
                <Text style={styles.text}>{hazard.subject}</Text>
            </Card>

            <Card>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.text}>{hazard.description}</Text>
            </Card>

            <Card>
                <Text style={styles.sectionTitle}>Location</Text>
                <Text style={styles.text}>📍 {hazard.location}</Text>
            </Card>

            <Card>
                <Text style={styles.sectionTitle}>Category</Text>
                <Text style={styles.text}>
                    {hazard.category.charAt(0).toUpperCase() + hazard.category.slice(1)}
                </Text>
            </Card>

            {/* Photos */}
            {(hazard.beforePhoto || hazard.afterPhoto) && (
                <Card>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    {hazard.beforePhoto && (
                        <View style={styles.photoSection}>
                            <Text style={styles.photoLabel}>Before</Text>
                            <Image
                                source={{ uri: hazard.beforePhoto }}
                                style={styles.photo}
                            />
                        </View>
                    )}
                    {hazard.afterPhoto && (
                        <View style={styles.photoSection}>
                            <Text style={styles.photoLabel}>After</Text>
                            <Image
                                source={{ uri: hazard.afterPhoto }}
                                style={styles.photo}
                            />
                        </View>
                    )}
                </Card>
            )}

            {hazard.notes && (
                <Card>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Text style={styles.text}>{hazard.notes}</Text>
                </Card>
            )}

            <Card>
                <Text style={styles.sectionTitle}>Timeline</Text>
                <Text style={styles.metaText}>
                    Created: {hazard.createdAt.toLocaleString()}
                </Text>
                <Text style={styles.metaText}>
                    Last Updated: {hazard.updatedAt.toLocaleString()}
                </Text>
            </Card>

            {/* Change Status Actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Change Status</Text>
                <View style={styles.statusButtons}>
                    {hazard.status !== HazardStatus.IN_PROGRESS && (
                        <Button
                            title="Mark In Progress"
                            onPress={() => handleStatusChange(HazardStatus.IN_PROGRESS)}
                            variant="secondary"
                            style={styles.actionButton}
                        />
                    )}
                    {hazard.status !== HazardStatus.CLOSED && (
                        <Button
                            title="Mark as Closed"
                            onPress={() => handleStatusChange(HazardStatus.CLOSED)}
                            variant="primary"
                            style={styles.actionButton}
                        />
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        color: Colors.light.text,
        lineHeight: 24,
    },
    metaText: {
        fontSize: 14,
        color: Colors.light.icon,
        marginTop: 4,
    },
    photoSection: {
        marginTop: 12,
    },
    photoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 8,
    },
    photo: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 16,
        color: Colors.light.danger,
        textAlign: 'center',
        padding: 20,
    },
    actionsSection: {
        marginTop: 16,
        marginBottom: 32,
    },
    statusButtons: {
        marginTop: 12,
        gap: 12,
    },
    actionButton: {
        width: '100%',
    },
});
