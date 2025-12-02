import { HazardCard } from '@/components/hse/HazardCard';
import { TaskCard } from '@/components/hse/TaskCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/store/AppContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type HSETab = 'tasks' | 'hazards' | 'voluntary';

export default function HSEScreen() {
    const { tasks, hazards, voluntaryActions, updateVoluntaryAction } = useApp();
    const [activeTab, setActiveTab] = useState<HSETab>('tasks');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>HSE</Text>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
                    onPress={() => setActiveTab('tasks')}
                >
                    <Text
                        style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}
                    >
                        Assigned Tasks
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'hazards' && styles.activeTab]}
                    onPress={() => setActiveTab('hazards')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'hazards' && styles.activeTabText,
                        ]}
                    >
                        My Hazards
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'voluntary' && styles.activeTab]}
                    onPress={() => setActiveTab('voluntary')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'voluntary' && styles.activeTabText,
                        ]}
                    >
                        Voluntary
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Assigned Tasks Tab */}
                {activeTab === 'tasks' && (
                    <View>
                        <Text style={styles.sectionDesc}>
                            Required tasks assigned by site management
                        </Text>
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onPress={() => router.push(`/hse/task/${task.id}`)}
                                />
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No assigned tasks</Text>
                        )}
                    </View>
                )}

                {/* My Hazards Tab */}
                {activeTab === 'hazards' && (
                    <View>
                        <Text style={styles.sectionDesc}>
                            Hazards reported through Hazard Hunt
                        </Text>

                        <Button
                            title="+ New Hazard Report"
                            onPress={() => router.push('/hse/new-hazard')}
                            size="large"
                            style={styles.newButton}
                        />

                        {hazards.length > 0 ? (
                            hazards.map((hazard) => (
                                <HazardCard
                                    key={hazard.id}
                                    hazard={hazard}
                                    onPress={() => router.push(`/hse/${hazard.id}`)}
                                />
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No hazards reported</Text>
                        )}
                    </View>
                )}

                {/* Voluntary Actions Tab */}
                {activeTab === 'voluntary' && (
                    <View>
                        <Text style={styles.sectionDesc}>
                            Optional HSE actions you can perform
                        </Text>
                        {voluntaryActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                onPress={() => {
                                    updateVoluntaryAction(action.id, {
                                        completed: !action.completed,
                                    });
                                }}
                            >
                                <Card>
                                    <View style={styles.voluntaryItem}>
                                        <View style={styles.voluntaryText}>
                                            <Text style={styles.voluntaryTitle}>{action.title}</Text>
                                            <Text style={styles.voluntaryDesc}>{action.description}</Text>
                                            <Text style={styles.optionalLabel}>Optional</Text>
                                        </View>
                                        <View>
                                            {action.completed ? (
                                                <Text style={styles.completedCheckmark}>✓</Text>
                                            ) : (
                                                <View style={styles.uncheckedBox} />
                                            )}
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        padding: 16,
        paddingTop: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.light.text,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: Colors.light.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: Colors.light.tint,
    },
    tabText: {
        fontSize: 14,
        color: Colors.light.icon,
        fontWeight: '500',
    },
    activeTabText: {
        color: Colors.light.tint,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    sectionDesc: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 16,
    },
    newButton: {
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.light.icon,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 40,
    },
    voluntaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    voluntaryText: {
        flex: 1,
        marginRight: 12,
    },
    voluntaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 4,
    },
    voluntaryDesc: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 6,
    },
    optionalLabel: {
        fontSize: 12,
        color: Colors.light.warning,
        fontWeight: '600',
    },
    completedCheckmark: {
        fontSize: 32,
        color: Colors.light.success,
        fontWeight: '700',
    },
    uncheckedBox: {
        width: 32,
        height: 32,
        borderWidth: 2,
        borderColor: Colors.light.border,
        borderRadius: 4,
    },
});
