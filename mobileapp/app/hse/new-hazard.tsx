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
import { useState, useEffect } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { hazards, auth } from '@/lib/api';

export default function NewHazardScreen() {
    const { currentUser, setCurrentUser, loadHazards } = useApp();

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
    const [loading, setLoading] = useState(false);

    // Load current user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!currentUser) {
                const user = await auth.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                }
            }
        };
        loadUser();
    }, []);

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

    const handleAddBeforePhoto = async () => {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is required to take photos');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setBeforePhoto(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleAddAfterPhoto = async () => {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is required to take photos');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setAfterPhoto(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleSaveDraft = async () => {
        if (!currentUser) {
            Alert.alert('Error', 'You must be logged in to save hazards');
            return;
        }

        setLoading(true);
        try {
            let beforePhotoUrl: string | undefined = undefined;
            let afterPhotoUrl: string | undefined = undefined;

            // Upload photos first if they exist
            if (beforePhoto) {
                // Create a temporary hazard ID for uploading
                const tempId = `temp_${Date.now()}`;
                const { data: photoUrl, error: photoError } = await hazards.uploadHazardPhoto(tempId, beforePhoto, 'before');
                if (!photoError && photoUrl) {
                    beforePhotoUrl = photoUrl;
                }
            }

            if (afterPhoto) {
                const tempId = `temp_${Date.now()}`;
                const { data: photoUrl, error: photoError } = await hazards.uploadHazardPhoto(tempId, afterPhoto, 'after');
                if (!photoError && photoUrl) {
                    afterPhotoUrl = photoUrl;
                }
            }

            const { data, error } = await hazards.createHazard({
                subject: formData.subject || 'Draft Hazard',
                description: formData.description || 'No description',
                location: formData.location || 'Unknown',
                category: formData.category,
                priority: formData.priority,
                status: 'open',
                before_photo_url: beforePhotoUrl,
                after_photo_url: afterPhotoUrl,
                reported_by: currentUser.id,
            });

            if (error) {
                Alert.alert('Error', error.message || 'Failed to save draft');
                return;
            }

            // Reload hazards
            await loadHazards();

            Alert.alert('Draft Saved', 'Hazard report saved as draft', [
                {
                    text: 'OK',
                    onPress: () => {
                        setTimeout(() => {
                            router.replace('/hse');
                        }, 100);
                    }
                },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        if (!currentUser) {
            Alert.alert('Error', 'You must be logged in to submit hazards');
            return;
        }

        setLoading(true);
        try {
            let beforePhotoUrl: string | undefined = undefined;
            let afterPhotoUrl: string | undefined = undefined;

            // Upload photos first if they exist
            if (beforePhoto) {
                const tempId = `temp_${Date.now()}`;
                const { data: photoUrl, error: photoError } = await hazards.uploadHazardPhoto(tempId, beforePhoto, 'before');
                if (photoError) {
                    Alert.alert('Warning', 'Failed to upload before photo, but hazard will be submitted without it');
                } else if (photoUrl) {
                    beforePhotoUrl = photoUrl;
                }
            }

            if (afterPhoto) {
                const tempId = `temp_${Date.now()}`;
                const { data: photoUrl, error: photoError } = await hazards.uploadHazardPhoto(tempId, afterPhoto, 'after');
                if (photoError) {
                    Alert.alert('Warning', 'Failed to upload after photo, but hazard will be submitted without it');
                } else if (photoUrl) {
                    afterPhotoUrl = photoUrl;
                }
            }

            const { data, error } = await hazards.createHazard({
                subject: formData.subject,
                description: formData.description,
                location: formData.location,
                category: formData.category,
                priority: formData.priority,
                status: 'open',
                before_photo_url: beforePhotoUrl,
                after_photo_url: afterPhotoUrl,
                reported_by: currentUser.id,
            });

            if (error) {
                Alert.alert('Error', error.message || 'Failed to submit hazard');
                return;
            }

            // Reload hazards to show the new one
            await loadHazards();

            Alert.alert('Success', 'Your hazard report has been submitted', [
                {
                    text: 'OK',
                    onPress: () => {
                        setTimeout(() => {
                            router.replace('/hse');
                        }, 100);
                    }
                },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
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
                    title={loading ? "Saving..." : "Save as Draft"}
                    onPress={handleSaveDraft}
                    variant="outline"
                    style={styles.footerButton}
                    disabled={loading}
                />
                <Button
                    title={loading ? "Submitting..." : "Submit Hazard"}
                    onPress={handleSubmit}
                    style={styles.footerButton}
                    disabled={loading}
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
