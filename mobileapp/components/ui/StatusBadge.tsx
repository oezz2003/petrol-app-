import { Colors } from '@/constants/Colors';
import {
    HazardPriority,
    HazardStatus,
    TaskStatus,
    WellStatus,
} from '@/types';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type StatusType = WellStatus | TaskStatus | HazardStatus | HazardPriority | string;

interface StatusBadgeProps {
    status: StatusType;
    style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
    const { backgroundColor, textColor, label } = getStatusStyle(status);

    return (
        <View style={[styles.badge, { backgroundColor }, style]}>
            <Text style={[styles.text, { color: textColor }]}>{label}</Text>
        </View>
    );
};

const getStatusStyle = (status: StatusType) => {
    const colors = Colors.light;

    switch (status) {
        // Well statuses
        case WellStatus.IN_PROGRESS:
            return {
                backgroundColor: colors.wellInProgress,
                textColor: '#FFFFFF',
                label: 'In Progress',
            };
        case WellStatus.COMPLETED:
            return {
                backgroundColor: colors.wellCompleted,
                textColor: '#FFFFFF',
                label: 'Completed',
            };
        case WellStatus.DRAFT:
            return {
                backgroundColor: colors.wellDraft,
                textColor: '#FFFFFF',
                label: 'Draft',
            };

        // Task statuses
        case TaskStatus.PENDING:
            return {
                backgroundColor: colors.taskPending,
                textColor: '#FFFFFF',
                label: 'Pending',
            };
        case TaskStatus.IN_PROGRESS:
            return {
                backgroundColor: colors.taskInProgress,
                textColor: '#FFFFFF',
                label: 'In Progress',
            };
        case TaskStatus.COMPLETED:
            return {
                backgroundColor: colors.taskCompleted,
                textColor: '#FFFFFF',
                label: 'Completed',
            };
        case TaskStatus.OVERDUE:
            return {
                backgroundColor: colors.taskOverdue,
                textColor: '#FFFFFF',
                label: 'Overdue',
            };

        // Hazard statuses
        case HazardStatus.OPEN:
            return {
                backgroundColor: colors.danger,
                textColor: '#FFFFFF',
                label: 'Open',
            };
        case HazardStatus.IN_PROGRESS:
            return {
                backgroundColor: colors.warning,
                textColor: '#000000',
                label: 'In Progress',
            };
        case HazardStatus.CLOSED:
            return {
                backgroundColor: colors.success,
                textColor: '#FFFFFF',
                label: 'Closed',
            };

        // Hazard priorities
        case HazardPriority.HIGH:
            return {
                backgroundColor: colors.hazardHigh,
                textColor: '#FFFFFF',
                label: 'High Priority',
            };
        case HazardPriority.MEDIUM:
            return {
                backgroundColor: colors.hazardMedium,
                textColor: '#FFFFFF',
                label: 'Medium Priority',
            };
        case HazardPriority.LOW:
            return {
                backgroundColor: colors.hazardLow,
                textColor: '#000000',
                label: 'Low Priority',
            };

        default:
            return {
                backgroundColor: '#9E9E9E',
                textColor: '#FFFFFF',
                label: String(status),
            };
    }
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
