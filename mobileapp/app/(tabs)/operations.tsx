import { WellCard } from '@/components/operations/WellCard';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/store/AppContext';
import { WellStatus } from '@/types';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function OperationsScreen() {
    const { wells } = useApp();

    const inProgressWells = wells.filter((w) => w.status === WellStatus.IN_PROGRESS || w.status === WellStatus.DRAFT);
    const completedWells = wells.filter((w) => w.status === WellStatus.COMPLETED);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Operations</Text>

            <Button
                title="+ Start New Well"
                onPress={() => router.push('/operations/new-well')}
                size="large"
                style={styles.newButton}
            />

            {/* Wells in Progress */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Wells in Progress</Text>
                {inProgressWells.length > 0 ? (
                    inProgressWells.map((well) => (
                        <WellCard
                            key={well.id}
                            well={well}
                            onPress={() => {
                                // TODO: Navigate to well details
                                console.log('Well tapped:', well.id);
                            }}
                        />
                    ))
                ) : (
                    <Text style={styles.emptyText}>No wells in progress</Text>
                )}
            </View>

            {/* Completed Wells */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completed Wells</Text>
                {completedWells.length > 0 ? (
                    completedWells.map((well) => (
                        <WellCard
                            key={well.id}
                            well={well}
                            onPress={() => {
                                // TODO: Navigate to well details
                                console.log('Well tapped:', well.id);
                            }}
                        />
                    ))
                ) : (
                    <Text style={styles.emptyText}>No completed wells</Text>
                )}
            </View>

            {/* Test button for Daily Report modal */}
            <Button
                title="📋 Open Daily Report (Test)"
                onPress={() => router.push('/daily-report-modal')}
                variant="outline"
                style={styles.testButton}
            />
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
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 20,
    },
    newButton: {
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.light.icon,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    testButton: {
        marginTop: 20,
        marginBottom: 40,
    },
});
