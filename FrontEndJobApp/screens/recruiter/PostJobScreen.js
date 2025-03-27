import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
import { ActivityIndicator, Button, Card, Chip, Divider, Switch, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';
import { AuthContext } from '../../contexts/AuthContext.js';

const PostJobScreen = ({ navigation, route }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [location, setLocation] = useState(null);
    const [mapRegion, setMapRegion] = useState(null);
    const [isRemote, setIsRemote] = useState(false);
    const [company, setCompany] = useState(null);
    const theme = useTheme();

    // Check if we're editing an existing job
    const editingJob = route.params?.jobId;

    const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm({
        defaultValues: {
            title: '',
            description: '',
            requirements: '',
            responsibilities: '',
            salary: '',
            working_hours: '',
            location_name: '',
        }
    });

    useEffect(() => {
        fetchSkills();
        fetchCompany();
        getInitialLocation();

        if (editingJob) {
            fetchJobDetails(editingJob);
        }
    }, [editingJob]);

    const fetchSkills = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/skills/`);
            setSkills(response.data);
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const fetchCompany = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/companies/me/`);
            setCompany(response.data);
        } catch (error) {
            console.error('Error fetching company:', error);
            setError('You need to create a company profile before posting jobs.');
        }
    };

    const fetchJobDetails = async (jobId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/jobs/${jobId}/`);
            const job = response.data;

            // Set form values
            setValue('title', job.title);
            setValue('description', job.description);
            setValue('requirements', job.requirements);
            setValue('responsibilities', job.responsibilities);
            setValue('salary', job.salary.toString());
            setValue('working_hours', job.working_hours);
            setValue('location_name', job.location);

            // Set selected skills
            setSelectedSkills(job.skills.map(skill => skill.id));

            // Set location
            if (job.location_details) {
                const jobLocation = {
                    latitude: parseFloat(job.location_details.latitude),
                    longitude: parseFloat(job.location_details.longitude),
                };
                setLocation(jobLocation);
                setMapRegion({
                    ...jobLocation,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }

            // Set remote status
            setIsRemote(job.is_remote);

        } catch (error) {
            console.error('Error fetching job details:', error);
            setError('Failed to load job details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getInitialLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            const initialRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setMapRegion(initialRegion);
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const handleMapPress = (event) => {
        if (isRemote) return;

        const { coordinate } = event.nativeEvent;
        setLocation(coordinate);
    };

    const toggleSkill = (skillId) => {
        if (selectedSkills.includes(skillId)) {
            setSelectedSkills(selectedSkills.filter(id => id !== skillId));
        } else {
            setSelectedSkills([...selectedSkills, skillId]);
        }
    };

    const onSubmit = async (data) => {
        if (!company) {
            alert('You need to create a company profile before posting jobs.');
            navigation.navigate('Company');
            return;
        }

        if (selectedSkills.length === 0) {
            alert('Please select at least one skill required for this job.');
            return;
        }

        if (!isRemote && !location) {
            alert('Please select a location on the map or mark the job as remote.');
            return;
        }

        try {
            setSubmitting(true);

            const jobData = {
                ...data,
                salary: parseFloat(data.salary),
                is_remote: isRemote,
                skills: selectedSkills,
            };

            if (!isRemote && location) {
                jobData.location_details = {
                    latitude: location.latitude,
                    longitude: location.longitude,
                };
            }

            let response;
            if (editingJob) {
                response = await axios.patch(`${API_URL}/api/jobs/${editingJob}/`, jobData);
                alert('Job updated successfully!');
            } else {
                response = await axios.post(`${API_URL}/api/jobs/`, jobData);
                alert('Job posted successfully!');

                // Reset form
                reset();
                setSelectedSkills([]);
                setLocation(null);
                setIsRemote(false);
            }

            navigation.navigate('ManageJobs');
        } catch (error) {
            console.error('Error posting job:', error);
            alert('Failed to post job. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading job details...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>{editingJob ? 'Edit Job' : 'Post a New Job'}</Title>

                    <Divider style={styles.divider} />

                    {!company && (
                        <View style={styles.warningContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#F44336" />
                            <Text style={styles.warningText}>
                                You need to create a company profile before posting jobs.
                            </Text>
                            <Button
                                mode="contained"
                                onPress={() => navigation.navigate('Company')}
                                style={styles.createCompanyButton}
                            >
                                Create Company Profile
                            </Button>
                        </View>
                    )}

                    <View style={styles.formContainer}>
                        <Controller
                            control={control}
                            rules={{
                                required: 'Job title is required',
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Job Title"
                                    mode="outlined"
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={!!errors.title}
                                    disabled={!company}
                                />
                            )}
                            name="title"
                        />

                        <Controller
                            control={control}
                            rules={{
                                required: 'Description is required',
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Job Description"
                                    mode="outlined"
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={!!errors.description}
                                    disabled={!company}
                                    multiline
                                    numberOfLines={4}
                                />
                            )}
                            name="description"
                        />

                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Requirements"
                                    mode="outlined"
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={!!errors.requirements}
                                    disabled={!company}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="List the requirements for this job"
                                />
                            )}
                            name="requirements"
                        />

                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Responsibilities"
                                    mode="outlined"
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={!!errors.responsibilities}
                                    disabled={!company}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="List the responsibilities for this job"
                                />
                            )}
                            name="responsibilities"
                        />

                        <View style={styles.row}>
                            <Controller
                                control={control}
                                rules={{
                                    required: 'Salary is required',
                                    pattern: {
                                        value: /^\d+(\.\d{1,2})?$/,
                                        message: 'Please enter a valid salary',
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Hourly Salary ($)"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.salary}
                                        disabled={!company}
                                        keyboardType="numeric"
                                        left={<TextInput.Affix text="$" />}
                                    />
                                )}
                                name="salary"
                            />

                            <Controller
                                control={control}
                                rules={{
                                    required: 'Working hours are required',
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Working Hours"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.working_hours}
                                        disabled={!company}
                                        placeholder="e.g. Evenings, Weekends"
                                    />
                                )}
                                name="working_hours"
                            />
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Required Skills</Title>

                    <Divider style={styles.divider} />

                    <View style={styles.skillsContainer}>
                        {skills.map(skill => (
                            <Chip
                                key={skill.id}
                                selected={selectedSkills.includes(skill.id)}
                                onPress={() => toggleSkill(skill.id)}
                                style={styles.skillChip}
                                selectedColor="#fff"
                                mode={selectedSkills.includes(skill.id) ? 'flat' : 'outlined'}
                                disabled={!company}
                            >
                                {skill.name}
                            </Chip>
                        ))}
                    </View>

                    {selectedSkills.length === 0 && (
                        <Text style={styles.skillsHint}>
                            Please select at least one skill required for this job.
                        </Text>
                    )}
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.locationHeader}>
                        <Title style={styles.cardTitle}>Job Location</Title>
                        <View style={styles.remoteSwitch}>
                            <Text>Remote Job</Text>
                            <Switch
                                value={isRemote}
                                onValueChange={setIsRemote}
                                color={theme.colors.primary}
                                disabled={!company}
                            />
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    <Controller
                        control={control}
                        rules={{
                            required: 'Location name is required',
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Location Name"
                                mode="outlined"
                                style={styles.input}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                error={!!errors.location_name}
                                disabled={!company}
                                placeholder="e.g. New York, NY"
                            />
                        )}
                        name="location_name"
                    />

                    {!isRemote && (
                        <>
                            <Text style={styles.mapInstructions}>
                                Tap on the map to set the exact job location
                            </Text>
                            {/* <View style={styles.mapContainer}>
                                {mapRegion && (
                                    <MapView
                                        style={styles.map}
                                        region={mapRegion}
                                        onPress={handleMapPress}
                                    >
                                        {location && (
                                            <Marker
                                                coordinate={location}
                                                title="Job Location"
                                            />
                                        )}
                                    </MapView>
                                )}
                            </View> */}
                        </>
                    )}
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
                loading={submitting}
                disabled={submitting || !company}
            >
                {editingJob ? 'Update Job' : 'Post Job'}
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    card: {
        margin: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
    },
    divider: {
        marginVertical: 15,
    },
    warningContainer: {
        backgroundColor: '#FFEBEE',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    warningText: {
        color: '#D32F2F',
        marginVertical: 10,
        textAlign: 'center',
    },
    createCompanyButton: {
        marginTop: 10,
    },
    formContainer: {
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        marginBottom: 15,
    },
    halfInput: {
        width: '48%',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    skillChip: {
        margin: 5,
    },
    skillsHint: {
        color: '#666',
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'center',
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    remoteSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapInstructions: {
        marginVertical: 10,
        color: '#666',
        fontStyle: 'italic',
    },
    mapContainer: {
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 10,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    submitButton: {
        margin: 20,
        paddingVertical: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
    },
});

export default PostJobScreen;