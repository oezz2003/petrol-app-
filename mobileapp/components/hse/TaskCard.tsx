import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/Colors';
import { AssignedTask, TaskStatus } from '@/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskCardProps {
    task: AssignedTask;
    onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
    const isOverdue = task.status === TaskStatus.OVERDUE;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card style={[isOverdue && styles.overdueCard]}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {task.title}
                    </Text>
                    <StatusBadge status={task.status} />
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {task.description}
                </Text>

                <View style={styles.footer}>
                    <Text style={[styles.dueDate, isOverdue && styles.overdueDueText]}>
                        Due: {task.dueDate.toLocaleDateString()}
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
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        flex: 1,
    },
    description: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 12,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        paddingTop: 8,
    },
    dueDate: {
        fontSize: 14,
        color: Colors.light.text,
    },
    overdueCard: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.light.taskOverdue,
    },
    overdueDueText: {
        color: Colors.light.taskOverdue,
        fontWeight: '600',
    },
});
