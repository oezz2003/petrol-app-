import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/store/AppContext';
import {
    ChecklistItem,
    PhotoItem,
    VoiceNoteItem,
    Well,
    WellBasicData,
    WellStatus,
} from '@/types';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const TOTAL_STEPS = 5;

const initialChecklist: ChecklistItem[] = [
    { id: '1', label: 'Rig inspection completed', checked: false, required: true },
    { id: '2', label: 'PPE checked', checked: false, required: true },
    { id: '3', label: 'Tools inspected', checked: false, required: true },
    { id: '4', label: 'Safety briefing conducted', checked: false, required: true },
    { id: '5', label: 'Emergency equipment verified', checked: false, required: false },
];

export default function NewWellScreen() {
    const { addWell, updateWell } = useApp();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Basic Data
    const [basicData, setBasicData] = useState<WellBasicData>({
        wellName: '',
        location: '',
        rigNameId: '',
        startDate: new Date(),
        notes: '',
    });

    // Step 2: Checklist
    const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

    // Step 3: Photos
    const [photos, setPhotos] = useState<PhotoItem[]>([]);

    // Step 4: Voice Notes
    const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>([]);

    // Validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!basicData.wellName.trim()) {
            newErrors.wellName = 'Well name is required';
        }
        if (!basicData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!basicData.rigNameId.trim()) {
            newErrors.rigNameId = 'Rig ID is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const requiredItems = checklist.filter((item) => item.required);
        const allChecked = requiredItems.every((item) => item.checked);

        if (!allChecked) {
            Alert.alert('Incomplete Checklist', 'Please complete all required checklist items');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        let isValid = true;

        if (currentStep === 1) {
            isValid = validateStep1();
        } else if (currentStep === 2) {
            isValid = validateStep2();
        }

        if (isValid && currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveDraft = () => {
        const well: Well = {
            id: Date.now().toString(),
            status: WellStatus.DRAFT,
            basicData,
            checklist,
            photos,
            voiceNotes,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        addWell(well);
        Alert.alert('Draft Saved', 'Your well has been saved as a draft', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    const handleSubmit = () => {
        const well: Well = {
            id: Date.now().toString(),
            status: WellStatus.COMPLETED,
            basicData,
            checklist,
            photos,
            voiceNotes,
            createdAt: new Date(),
            updatedAt: new Date(),
            completedAt: new Date(),
        };

        addWell(well);
        Alert.alert('Well Submitted', 'Your well has been successfully submitted', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    const toggleChecklistItem = (id: string) => {
        setChecklist((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const addPhoto = () => {
        // Mock photo addition
        const newPhoto: PhotoItem = {
            id: Date.now().toString(),
            uri: `https://via.placeholder.com/300x200?text=Photo+${photos.length + 1}`,
            timestamp: new Date(),
        };
        setPhotos([...photos, newPhoto]);
    };

    const removePhoto = (id: string) => {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
    };

    const addVoiceNote = () => {
        // Mock voice note
        const duration = Math.floor(Math.random() * 120) + 15; // 15-135 seconds
        const newNote: VoiceNoteItem = {
            id: Date.now().toString(),
            duration,
            timestamp: new Date(),
        };
        setVoiceNotes([...voiceNotes, newNote]);
    };

    const removeVoiceNote = (id: string) => {
        setVoiceNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <ProgressStepper
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                labels={['Basic', 'Checklist', 'Photos', 'Voice', 'Summary']}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                {/* STEP 1: Basic Data */}
                {currentStep === 1 && (
                    <View>
                        <Text style={styles.stepTitle}>Well Basic Data</Text>
                        <Input
                            label="Well Name"
                            value={basicData.wellName}
                            onChangeText={(text) =>
                                setBasicData({ ...basicData, wellName: text })
                            }
                            placeholder="e.g. Well Alpha-7"
                            required
                            error={errors.wellName}
                        />
                        <Input
                            label="Location"
                            value={basicData.location}
                            onChangeText={(text) =>
                                setBasicData({ ...basicData, location: text })
                            }
                            placeholder="e.g. Site A, Block 12"
                            required
                            error={errors.location}
                        />
                        <Input
                            label="Rig Name / ID"
                            value={basicData.rigNameId}
                            onChangeText={(text) =>
                                setBasicData({ ...basicData, rigNameId: text })
                            }
                            placeholder="e.g. RIG-001"
                            required
                            error={errors.rigNameId}
                        />
                        <Input
                            label="Notes (Optional)"
                            value={basicData.notes}
                            onChangeText={(text) =>
                                setBasicData({ ...basicData, notes: text })
                            }
                            placeholder="Additional information..."
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                )}

                {/* STEP 2: Checklist */}
                {currentStep === 2 && (
                    <View>
                        <Text style={styles.stepTitle}>Safety Checklist</Text>
                        <Text style={styles.subtitle}>
                            Complete all required items before proceeding
                        </Text>
                        {checklist.map((item) => (
                            <Card key={item.id}>
                                <View style={styles.checklistItem}>
                                    <View style={styles.checklistText}>
                                        <Text style={styles.checklistLabel}>
                                            {item.label}
                                            {item.required && (
                                                <Text style={styles.requiredMark}> *</Text>
                                            )}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={item.checked}
                                        onValueChange={() => toggleChecklistItem(item.id)}
                                        trackColor={{ false: '#ccc', true: Colors.light.success }}
                                        thumbColor="#fff"
                                    />
                                </View>
                            </Card>
                        ))}
                    </View>
                )}

                {/* STEP 3: Photos */}
                {currentStep === 3 && (
                    <View>
                        <Text style={styles.stepTitle}>Photos</Text>
                        <Text style={styles.subtitle}>
                            Add photos of the site and equipment
                        </Text>

                        <Button
                            title="📷 Add Photo"
                            onPress={addPhoto}
                            variant="outline"
                            style={styles.addButton}
                        />

                        <View style={styles.photoGrid}>
                            {photos.map((photo) => (
                                <View key={photo.id} style={styles.photoContainer}>
                                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removePhoto(photo.id)}
                                    >
                                        <Text style={styles.removeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {photos.length === 0 && (
                            <Text style={styles.emptyText}>No photos added yet</Text>
                        )}
                    </View>
                )}

                {/* STEP 4: Voice Notes */}
                {currentStep === 4 && (
                    <View>
                        <Text style={styles.stepTitle}>Voice Notes</Text>
                        <Text style={styles.subtitle}>
                            Record voice notes for additional context
                        </Text>

                        <Button
                            title="🎤 Record Voice Note"
                            onPress={addVoiceNote}
                            variant="primary"
                            size="large"
                            style={styles.addButton}
                        />

                        {voiceNotes.map((note, index) => (
                            <Card key={note.id}>
                                <View style={styles.voiceNoteItem}>
                                    <View>
                                        <Text style={styles.voiceNoteTitle}>
                                            Voice Note {index + 1}
                                        </Text>
                                        <Text style={styles.voiceNoteDuration}>
                                            Duration: {formatDuration(note.duration)}
                                        </Text>
                                        <Text style={styles.voiceNoteTime}>
                                            {note.timestamp.toLocaleTimeString()}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeVoiceNote(note.id)}>
                                        <Text style={styles.removeText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        ))}

                        {voiceNotes.length === 0 && (
                            <Text style={styles.emptyText}>No voice notes recorded</Text>
                        )}
                    </View>
                )}

                {/* STEP 5: Summary */}
                {currentStep === 5 && (
                    <View>
                        <Text style={styles.stepTitle}>Summary</Text>
                        <Text style={styles.subtitle}>Review before submitting</Text>

                        <Card>
                            <Text style={styles.summarySection}>Basic Information</Text>
                            <Text style={styles.summaryItem}>
                                Well: {basicData.wellName}
                            </Text>
                            <Text style={styles.summaryItem}>
                                Location: {basicData.location}
                            </Text>
                            <Text style={styles.summaryItem}>
                                Rig: {basicData.rigNameId}
                            </Text>
                            {basicData.notes && (
                                <Text style={styles.summaryItem}>
                                    Notes: {basicData.notes}
                                </Text>
                            )}
                        </Card>

                        <Card>
                            <Text style={styles.summarySection}>Checklist Status</Text>
                            <Text style={styles.summaryItem}>
                                Completed: {checklist.filter((i) => i.checked).length} /{' '}
                                {checklist.length} items
                            </Text>
                        </Card>

                        <Card>
                            <Text style={styles.summarySection}>Attachments</Text>
                            <Text style={styles.summaryItem}>
                                📷 Photos: {photos.length}
                            </Text>
                            <Text style={styles.summaryItem}>
                                🎤 Voice Notes: {voiceNotes.length}
                            </Text>
                        </Card>
                    </View>
                )}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.footer}>
                {currentStep < TOTAL_STEPS ? (
                    <View style={styles.footerButtons}>
                        {currentStep > 1 && (
                            <Button
                                title="Previous"
                                onPress={handlePrevious}
                                variant="outline"
                                style={styles.footerButton}
                            />
                        )}
                        <Button
                            title="Next"
                            onPress={handleNext}
                            style={[styles.footerButton, currentStep === 1 && styles.singleButton]}
                        />
                    </View>
                ) : (
                    <View style={styles.footerButtons}>
                        <Button
                            title="Save as Draft"
                            onPress={handleSaveDraft}
                            variant="outline"
                            style={styles.footerButton}
                        />
                        <Button
                            title="Submit Well"
                            onPress={handleSubmit}
                            style={styles.footerButton}
                        />
                    </View>
                )}
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
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 20,
    },
    checklistItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    checklistText: {
        flex: 1,
        marginRight: 12,
    },
    checklistLabel: {
        fontSize: 16,
        color: Colors.light.text,
    },
    requiredMark: {
        color: Colors.light.danger,
    },
    addButton: {
        marginBottom: 16,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    photoContainer: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    photoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: Colors.light.danger,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    voiceNoteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    voiceNoteTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    voiceNoteDuration: {
        fontSize: 14,
        color: Colors.light.icon,
        marginTop: 4,
    },
    voiceNoteTime: {
        fontSize: 12,
        color: Colors.light.icon,
        marginTop: 2,
    },
    removeText: {
        color: Colors.light.danger,
        fontWeight: '600',
    },
    summarySection: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 8,
    },
    summaryItem: {
        fontSize: 14,
        color: Colors.light.text,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.light.icon,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 30,
    },
    footer: {
        padding: 16,
        backgroundColor: Colors.light.card,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    footerButton: {
        flex: 1,
    },
    singleButton: {
        flex: 1,
    },
});
