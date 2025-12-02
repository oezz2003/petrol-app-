import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/store/AppContext';
import {
    Hazard,
    HazardCategory,
    HazardPriority,
    HazardStatus,
} from '@/types';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NewHazardScreen() {
    const { addHazard } = useApp();

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        location: '',
        category: HazardCategory.HOUSEKEEPING,
        priority: HazardPriority.MEDIUM,
    });

    const [beforePhoto, setBeforePhoto] = useState<string | undefined>(undefined);
    const [afterPhoto, setAfterPhoto] = useState<string | undefined>(undefined);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddBeforePhoto = () => {
        // Mock photo
        setBeforePhoto('https://via.placeholder.com/400x300/ff9900/ffffff?text=Before+Photo');
    };

    const handleAddAfterPhoto = () => {
        // Mock photo
        setAfterPhoto('https://via.placeholder.com/400x300/00ff00/ffffff?text=After+Photo');
    };

    const handleSaveDraft = () => {
        const hazard: Hazard = {
            id: Date.now().toString(),
            ...formData,
            status: HazardStatus.OPEN,
            beforePhoto,
            afterPhoto,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        addHazard(hazard);
        Alert.alert('Draft Saved', 'Hazard report saved as draft', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        const hazard: Hazard = {
            id: Date.now().toString(),
            ...formData,
            status: HazardStatus.OPEN,
            beforePhoto,
            afterPhoto,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        addHazard(hazard);
        Alert.alert('Hazard Submitted', 'Your hazard report has been submitted', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                <Text style={styles.title}>New Hazard Report</Text>
                <Text style={styles.subtitle}>Report safety hazards and concerns</Text>

                <Input
                    label="Subject / Title"
                    value={formData.subject}
                    onChangeText={(text) => setFormData({ ...formData, subject: text })}
                    placeholder="Brief description of the hazard"
                    required
                    error={errors.subject}
                />

                <Input
                    label="Description"
                    value={formData.description}
                    onChangeText={(text) =>
                        setFormData({ ...formData, description: text })
                    }
                    placeholder="Detailed description..."
                    multiline
                    numberOfLines={4}
                    required
                    error={errors.description}
                />

                <Input
                    label="Location"
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="Where is this hazard located?"
                    required
                    error={errors.location}
                />

                {/* Category Selector */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Category <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.chipContainer}>
                        {Object.values(HazardCategory).map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.chip,
                                    formData.category === cat && styles.chipActive,
                                ]}
                                onPress={() => setFormData({ ...formData, category: cat })}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        formData.category === cat && styles.chipTextActive,
                                    ]}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Priority Selector */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Priority <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.chipContainer}>
                        {Object.values(HazardPriority).map((pri) => (
                            <TouchableOpacity
                                key={pri}
                                style={[
                                    styles.chip,
                                    formData.priority === pri && styles.chipActive,
                                    formData.priority === pri && pri === HazardPriority.HIGH && styles.chipHigh,
                                ]}
                                onPress={() => setFormData({ ...formData, priority: pri })}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        formData.priority === pri && styles.chipTextActive,
                                    ]}
                                >
                                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Photos */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Before Photo (Optional)</Text>
                    {beforePhoto ? (
                        <View style={styles.photoContainer}>
                            <Image source={{ uri: beforePhoto }} style={styles.photo} />
                            <TouchableOpacity
                                style={styles.removePhotoButton}
                                onPress={() => setBeforePhoto(undefined)}
                            >
                                <Text style={styles.removePhotoText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Button
                            title="📷 Add Before Photo"
                            onPress={handleAddBeforePhoto}
                            variant="outline"
                        />
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>After Photo (Optional)</Text>
                    {afterPhoto ? (
                        <View style={styles.photoContainer}>
                            <Image source={{ uri: afterPhoto }} style={styles.photo} />
                            <TouchableOpacity
                                style={styles.removePhotoButton}
                                onPress={() => setAfterPhoto(undefined)}
                            >
                                <Text style={styles.removePhotoText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Button
                            title="📷 Add After Photo"
                            onPress={handleAddAfterPhoto}
                            variant="outline"
                        />
                    )}
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <Button
                    title="Save as Draft"
                    onPress={handleSaveDraft}
                    variant="outline"
                    style={styles.footerButton}
                />
                <Button
                    title="Submit Hazard"
                    onPress={handleSubmit}
                    style={styles.footerButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 8,
    },
    required: {
        color: Colors.light.danger,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.light.border,
        backgroundColor: Colors.light.card,
    },
    chipActive: {
        backgroundColor: Colors.light.tint,
        borderColor: Colors.light.tint,
    },
    chipHigh: {
        backgroundColor: Colors.light.hazardHigh,
        borderColor: Colors.light.hazardHigh,
    },
    chipText: {
        fontSize: 14,
        color: Colors.light.text,
    },
    chipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    photoContainer: {
        width: '100%',
        marginBottom: 8,
    },
    photo: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    removePhotoButton: {
        alignSelf: 'flex-start',
    },
    removePhotoText: {
        color: Colors.light.danger,
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: Colors.light.card,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        gap: 12,
    },
    footerButton: {
        flex: 1,
    },
});
