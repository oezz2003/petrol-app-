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
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
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

const TOTAL_STEPS = 9;

// Expanded checklist for taller step 2
const initialChecklist: ChecklistItem[] = [
    { id: '1', label: 'Rig inspection completed', checked: false, required: true },
    { id: '2', label: 'PPE checked and verified', checked: false, required: true },
    { id: '3', label: 'Tools inspected', checked: false, required: true },
    { id: '4', label: 'Safety briefing conducted', checked: false, required: true },
    { id: '5', label: 'Emergency equipment verified', checked: false, required: true },
    { id: '6', label: 'First aid kit checked', checked: false, required: true },
    { id: '7', label: 'Fire extinguishers inspected', checked: false, required: true },
    { id: '8', label: 'Communication systems tested', checked: false, required: true },
    { id: '9', label: 'Weather conditions assessed', checked: false, required: false },
    { id: '10', label: 'Emergency evacuation route confirmed', checked: false, required: true },
    { id: '11', label: 'Gas detection equipment calibrated', checked: false, required: true },
    { id: '12', label: 'Lighting systems verified', checked: false, required: false },
    { id: '13', label: 'Backup power systems tested', checked: false, required: false },
    { id: '14', label: 'Safety signage posted', checked: false, required: true },
    { id: '15', label: 'Personnel accountability system active', checked: false, required: true },
];

export default function NewWellScreen() {
    const { addWell } = useApp();

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

    // Step 2: Safety Checklist (tall)
    const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

    // Step 3: Photos with real camera
    const [photos, setPhotos] = useState<PhotoItem[]>([]);

    // Step 4: Additional Details (short)
    const [additionalDetails, setAdditionalDetails] = useState({
        operator: '',
        supervisor: '',
    });

    // Step 5: Equipment Inspection
    const [equipment, setEquipment] = useState({
        drillingRigModel: '',
        mudPumps: '',
        blowoutPreventer: '',
    });

    // Step 6: Environmental Data
    const [environmental, setEnvironmental] = useState({
        temperature: '',
        windSpeed: '',
        weatherConditions: '',
        soilType: '',
    });

    // Step 7: Voice Notes with real recording
    const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>([]);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    // Step 8: Final Comments (short)
    const [finalComments, setFinalComments] = useState('');

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

    // Real camera functionality
    const requestCameraPermission = async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Camera permission is required to take photos. Please enable it in your device settings.'
            );
            return false;
        }
        return true;
    };

    const requestMediaLibraryPermission = async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Media library permission is required to select photos.'
            );
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const newPhoto: PhotoItem = {
                    id: Date.now().toString(),
                    uri: result.assets[0].uri,
                    timestamp: new Date(),
                };
                setPhotos([...photos, newPhoto]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const pickImage = async () => {
        const hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const newPhoto: PhotoItem = {
                    id: Date.now().toString(),
                    uri: result.assets[0].uri,
                    timestamp: new Date(),
                };
                setPhotos([...photos, newPhoto]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to select image. Please try again.');
        }
    };

    const removePhoto = (id: string) => {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
    };

    // Real voice recording functionality
    const requestMicrophonePermission = async (): Promise<boolean> => {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Microphone permission is required to record voice notes. Please enable it in your device settings.'
            );
            return false;
        }
        return true;
    };

    const startRecording = async () => {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) return;

        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();

            const uri = recording.getURI();
            const status = await recording.getStatusAsync();

            if (uri && status.isLoaded) {
                const duration = Math.floor((status.durationMillis || 0) / 1000);
                const newNote: VoiceNoteItem = {
                    id: Date.now().toString(),
                    uri,
                    duration,
                    timestamp: new Date(),
                };
                setVoiceNotes([...voiceNotes, newNote]);
            }

            setRecording(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to stop recording. Please try again.');
            setRecording(null);
        }
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
                labels={[
                    'Basic',
                    'Safety',
                    'Photos',
                    'Details',
                    'Equipment',
                    'Environment',
                    'Voice',
                    'Comments',
                    'Summary',
                ]}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                {/* STEP 1: Basic Data (Regular height) */}
                {currentStep === 1 && (
                    <View style={styles.regularStep}>
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

                {/* STEP 2: Safety Checklist (Tall - 3 pages) */}
                {currentStep === 2 && (
                    <View style={styles.tallStep}>
                        <Text style={styles.stepTitle}>Comprehensive Safety Checklist</Text>
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

                {/* STEP 3: Photos with Real Camera (Regular height) */}
                {currentStep === 3 && (
                    <View style={styles.regularStep}>
                        <Text style={styles.stepTitle}>Capture Photos</Text>
                        <Text style={styles.subtitle}>
                            Take photos of the site and equipment
                        </Text>

                        <View style={styles.buttonRow}>
                            <Button
                                title="📷 Take Photo"
                                onPress={takePhoto}
                                variant="primary"
                                style={styles.halfButton}
                            />
                            <Button
                                title="🖼️ Choose from Gallery"
                                onPress={pickImage}
                                variant="outline"
                                style={styles.halfButton}
                            />
                        </View>

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

                {/* STEP 4: Additional Details (Short - half page) */}
                {currentStep === 4 && (
                    <View style={styles.shortStep}>
                        <Text style={styles.stepTitle}>Additional Details</Text>
                        <Input
                            label="Operator Name"
                            value={additionalDetails.operator}
                            onChangeText={(text) =>
                                setAdditionalDetails({ ...additionalDetails, operator: text })
                            }
                            placeholder="Enter operator name"
                        />
                        <Input
                            label="Supervisor Name"
                            value={additionalDetails.supervisor}
                            onChangeText={(text) =>
                                setAdditionalDetails({ ...additionalDetails, supervisor: text })
                            }
                            placeholder="Enter supervisor name"
                        />
                    </View>
                )}

                {/* STEP 5: Equipment Inspection (Regular height) */}
                {currentStep === 5 && (
                    <View style={styles.regularStep}>
                        <Text style={styles.stepTitle}>Equipment Inspection</Text>
                        <Text style={styles.subtitle}>Document equipment details</Text>
                        <Input
                            label="Drilling Rig Model"
                            value={equipment.drillingRigModel}
                            onChangeText={(text) =>
                                setEquipment({ ...equipment, drillingRigModel: text })
                            }
                            placeholder="e.g. Parker 85-RD"
                        />
                        <Input
                            label="Mud Pumps"
                            value={equipment.mudPumps}
                            onChangeText={(text) =>
                                setEquipment({ ...equipment, mudPumps: text })
                            }
                            placeholder="e.g. Triplex, 1600 HP"
                        />
                        <Input
                            label="Blowout Preventer (BOP)"
                            value={equipment.blowoutPreventer}
                            onChangeText={(text) =>
                                setEquipment({ ...equipment, blowoutPreventer: text })
                            }
                            placeholder="e.g. Cameron Type U, 10,000 PSI"
                            multiline
                            numberOfLines={2}
                        />
                    </View>
                )}

                {/* STEP 6: Environmental Data (Regular height) */}
                {currentStep === 6 && (
                    <View style={styles.regularStep}>
                        <Text style={styles.stepTitle}>Environmental Conditions</Text>
                        <Text style={styles.subtitle}>Record current site conditions</Text>
                        <Input
                            label="Temperature (°C)"
                            value={environmental.temperature}
                            onChangeText={(text) =>
                                setEnvironmental({ ...environmental, temperature: text })
                            }
                            placeholder="e.g. 28"
                            keyboardType="numeric"
                        />
                        <Input
                            label="Wind Speed (km/h)"
                            value={environmental.windSpeed}
                            onChangeText={(text) =>
                                setEnvironmental({ ...environmental, windSpeed: text })
                            }
                            placeholder="e.g. 15"
                            keyboardType="numeric"
                        />
                        <Input
                            label="Weather Conditions"
                            value={environmental.weatherConditions}
                            onChangeText={(text) =>
                                setEnvironmental({ ...environmental, weatherConditions: text })
                            }
                            placeholder="e.g. Clear, Partly cloudy, Rainy"
                        />
                        <Input
                            label="Soil Type"
                            value={environmental.soilType}
                            onChangeText={(text) =>
                                setEnvironmental({ ...environmental, soilType: text })
                            }
                            placeholder="e.g. Clay, Sand, Rock"
                        />
                    </View>
                )}

                {/* STEP 7: Voice Notes with Real Recording (Regular height) */}
                {currentStep === 7 && (
                    <View style={styles.regularStep}>
                        <Text style={styles.stepTitle}>Voice Notes</Text>
                        <Text style={styles.subtitle}>
                            Record voice notes for additional context
                        </Text>

                        {!isRecording ? (
                            <Button
                                title="🎤 Start Recording"
                                onPress={startRecording}
                                variant="primary"
                                size="large"
                                style={styles.addButton}
                            />
                        ) : (
                            <Button
                                title="⏹️ Stop Recording"
                                onPress={stopRecording}
                                variant="danger"
                                size="large"
                                style={styles.addButton}
                            />
                        )}

                        {isRecording && (
                            <View style={styles.recordingIndicator}>
                                <Text style={styles.recordingText}>🔴 Recording...</Text>
                            </View>
                        )}

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

                        {voiceNotes.length === 0 && !isRecording && (
                            <Text style={styles.emptyText}>No voice notes recorded</Text>
                        )}
                    </View>
                )}

                {/* STEP 8: Final Comments (Short - half page) */}
                {currentStep === 8 && (
                    <View style={styles.shortStep}>
                        <Text style={styles.stepTitle}>Final Comments</Text>
                        <Input
                            label="Additional Comments"
                            value={finalComments}
                            onChangeText={setFinalComments}
                            placeholder="Any final notes or observations..."
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                )}

                {/* STEP 9: Summary (Regular height) */}
                {currentStep === 9 && (
                    <View style={styles.regularStep}>
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
                            <Text style={styles.summarySection}>Safety Checklist</Text>
                            <Text style={styles.summaryItem}>
                                Completed: {checklist.filter((i) => i.checked).length} /{' '}
                                {checklist.length} items
                            </Text>
                        </Card>

                        {additionalDetails.operator && (
                            <Card>
                                <Text style={styles.summarySection}>Personnel</Text>
                                <Text style={styles.summaryItem}>
                                    Operator: {additionalDetails.operator}
                                </Text>
                                {additionalDetails.supervisor && (
                                    <Text style={styles.summaryItem}>
                                        Supervisor: {additionalDetails.supervisor}
                                    </Text>
                                )}
                            </Card>
                        )}

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
    // Variable height containers
    shortStep: {
        minHeight: 200,
    },
    regularStep: {
        minHeight: 400,
    },
    tallStep: {
        minHeight: 1200,
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
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfButton: {
        flex: 1,
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
    recordingIndicator: {
        backgroundColor: '#FFE5E5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    recordingText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.danger,
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
