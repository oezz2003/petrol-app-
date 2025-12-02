import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/store/AppContext';
import { TaskStatus } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TaskDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { tasks, updateTask } = useApp();

    const task = tasks.find((t) => t.id === id);

    if (!task) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Task not found</Text>
            </View>
        );
    }

    const handleStatusChange = (newStatus: TaskStatus) => {
        updateTask(task.id, { status: newStatus });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
                <StatusBadge status={task.status} />
            </View>

            <Card>
                <Text style={styles.sectionTitle}>Title</Text>
                <Text style={styles.text}>{task.title}</Text>
            </Card>

            <Card>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.text}>{task.description}</Text>
            </Card>

            <Card>
                <Text style={styles.sectionTitle}>Due Date</Text>
                <Text
                    style={[
                        styles.text,
                        task.status === TaskStatus.OVERDUE && styles.overdueText,
                    ]}
                >
                    {task.dueDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Text>
            </Card>

            <Card>
                <Text style={styles.sectionTitle}>Timeline</Text>
                <Text style={styles.metaText}>
                    Assigned: {task.createdAt.toLocaleString()}
                </Text>
                <Text style={styles.metaText}>
                    Last Updated: {task.updatedAt.toLocaleString()}
                </Text>
            </Card>

            {/* Change Status Actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Update Task Status</Text>
                <View style={styles.statusButtons}>
                    {task.status !== TaskStatus.IN_PROGRESS && task.status !== TaskStatus.COMPLETED && (
                        <Button
                            title="Start Task"
                            onPress={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                            variant="secondary"
                            style={styles.actionButton}
                        />
                    )}
                    {task.status !== TaskStatus.COMPLETED && (
                        <Button
                            title="Mark as Completed"
                            onPress={() => handleStatusChange(TaskStatus.COMPLETED)}
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
    overdueText: {
        color: Colors.light.taskOverdue,
        fontWeight: '600',
    },
    metaText: {
        fontSize: 14,
        color: Colors.light.icon,
        marginTop: 4,
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
