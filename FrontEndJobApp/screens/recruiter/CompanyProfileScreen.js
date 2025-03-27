import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Divider, IconButton, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';
import { AuthContext } from '../../contexts/AuthContext.js';

const CompanyProfileScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [logo, setLogo] = useState(null);
    const [images, setImages] = useState([]);
    const [verificationStatus, setVerificationStatus] = useState('unverified');
    const [verificationDocuments, setVerificationDocuments] = useState([]);
    const theme = useTheme();

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            website: '',
            industry: '',
            size: '',
            founded_year: '',
            address: '',
            phone: '',
            email: '',
        }
    });

    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/companies/me/`);
            setCompany(response.data);

            // Set form values
            setValue('name', response.data.name || '');
            setValue('description', response.data.description || '');
            setValue('website', response.data.website || '');
            setValue('industry', response.data.industry || '');
            setValue('size', response.data.size || '');
            setValue('founded_year', response.data.founded_year ? response.data.founded_year.toString() : '');
            setValue('address', response.data.address || '');
            setValue('phone', response.data.phone || '');
            setValue('email', response.data.email || '');

            setLogo(response.data.logo);
            setImages(response.data.images || []);
            setVerificationStatus(response.data.verification_status || 'unverified');

            // Fetch verification documents if any
            if (response.data.id) {
                fetchVerificationDocuments(response.data.id);
            }

            setError(null);
        } catch (error) {
            console.error('Error fetching company profile:', error);
            setError('Failed to load company profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchVerificationDocuments = async (companyId) => {
        try {
            const response = await axios.get(`${API_URL}/api/verification/`, {
                params: { company: companyId }
            });
            setVerificationDocuments(response.data);
        } catch (error) {
            console.error('Error fetching verification documents:', error);
        }
    };

    const pickLogo = async () => {
        if (!editMode) return;

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.cancelled) {
            setLogo(result.uri);
        }
    };

    const pickImage = async () => {
        if (!editMode) return;

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.5,
        });

        if (!result.cancelled) {
            setImages([...images, { uri: result.uri, isNew: true }]);
        }
    };

    const removeImage = (index) => {
        if (!editMode) return;

        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const pickVerificationDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.type === 'success') {
                // Upload document
                const formData = new FormData();
                formData.append('company', company.id);
                formData.append('document', {
                    uri: result.uri,
                    name: result.name,
                    type: 'application/pdf',
                });
                formData.append('document_type', 'business_registration');

                const response = await axios.post(`${API_URL}/api/verification/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Update verification documents list
                setVerificationDocuments([...verificationDocuments, response.data]);
                alert('Document uploaded successfully. It will be reviewed by our team.');
            }
        } catch (error) {
            console.error('Error uploading verification document:', error);
            alert('Failed to upload document. Please try again.');
        }
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            const formData = new FormData();
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            // Add logo if changed
            if (logo && (company?.logo !== logo)) {
                const filename = logo.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image';

                formData.append('logo', {
                    uri: logo,
                    name: filename,
                    type,
                });
            }

            // Add new images
            images.forEach((image, index) => {
                if (image.isNew) {
                    const filename = image.uri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : 'image';

                    formData.append(`images[${index}]`, {
                        uri: image.uri,
                        name: filename,
                        type,
                    });
                }
            });

            // Update company profile
            let response;
            if (company?.id) {
                response = await axios.patch(`${API_URL}/api/companies/${company.id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                response = await axios.post(`${API_URL}/api/companies/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            setCompany(response.data);
            setEditMode(false);
            alert('Company profile updated successfully!');
        } catch (error) {
            console.error('Error updating company profile:', error);
            alert('Failed to update company profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading company profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={pickLogo} disabled={!editMode}>
                    {logo ? (
                        <Avatar.Image
                            size={100}
                            source={{ uri: logo }}
                            style={styles.logo}
                        />
                    ) : (
                        <Avatar.Icon
                            size={100}
                            icon="domain"
                            style={styles.logo}
                        />
                    )}
                    {editMode && (
                        <View style={styles.editLogoIcon}>
                            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Title>{company?.name || 'Your Company'}</Title>
                    <View style={styles.verificationBadge}>
                        {verificationStatus === 'verified' ? (
                            <>
                                <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
                                <Text style={[styles.verificationText, { color: '#4CAF50' }]}>Verified</Text>
                            </>
                        ) : verificationStatus === 'pending' ? (
                            <>
                                <MaterialCommunityIcons name="clock-outline" size={16} color="#FFA000" />
                                <Text style={[styles.verificationText, { color: '#FFA000' }]}>Verification Pending</Text>
                            </>
                        ) : (
                            <>
                                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#F44336" />
                                <Text style={[styles.verificationText, { color: '#F44336' }]}>Not Verified</Text>
                            </>
                        )}
                    </View>
                </View>

                {!editMode ? (
                    <Button
                        mode="text"
                        onPress={() => setEditMode(true)}
                        icon="pencil"
                    >
                        Edit
                    </Button>
                ) : (
                    <Button
                        mode="text"
                        onPress={() => setEditMode(false)}
                        icon="close"
                        color="red"
                    >
                        Cancel
                    </Button>
                )}
            </View>

            {verificationStatus !== 'verified' && (
                <Card style={styles.verificationCard}>
                    <Card.Content>
                        <View style={styles.verificationCardHeader}>
                            <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
                            <Text style={styles.verificationCardTitle}>Verify Your Company</Text>
                        </View>
                        <Text style={styles.verificationCardText}>
                            Verified companies receive more applications and appear higher in search results.
                        </Text>
                        <Button
                            mode="contained"
                            onPress={pickVerificationDocument}
                            style={styles.verificationButton}
                            disabled={verificationStatus === 'pending'}
                        >
                            {verificationStatus === 'pending' ? 'Verification in Progress' : 'Upload Verification Documents'}
                        </Button>
                    </Card.Content>
                </Card>
            )}

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Company Information</Title>

                    <Divider style={styles.divider} />

                    <View style={styles.formContainer}>
                        <Controller
                            control={control}
                            rules={{
                                required: 'Company name is required',
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Company Name"
                                    mode="outlined"
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={!!errors.name}
                                    disabled={!editMode}
                                />
                            )}
                            name="name"
                        />

                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Description"
                                    mode="outlined"
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={!!errors.description}
                                    disabled={!editMode}
                                    multiline
                                    numberOfLines={4}
                                />
                            )}
                            name="description"
                        />

                        <View style={styles.row}>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Industry"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.industry}
                                        disabled={!editMode}
                                    />
                                )}
                                name="industry"
                            />

                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Company Size"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.size}
                                        disabled={!editMode}
                                    />
                                )}
                                name="size"
                            />
                        </View>

                        <View style={styles.row}>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Founded Year"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.founded_year}
                                        disabled={!editMode}
                                        keyboardType="numeric"
                                    />
                                )}
                                name="founded_year"
                            />

                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Website"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.website}
                                        disabled={!editMode}
                                        keyboardType="url"
                                        autoCapitalize="none"
                                    />
                                )}
                                name="website"
                            />
                        </View>

                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Address"
                                    mode="outlined"
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={!!errors.address}
                                    disabled={!editMode}
                                />
                            )}
                            name="address"
                        />

                        <View style={styles.row}>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Phone"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.phone}
                                        disabled={!editMode}
                                        keyboardType="phone-pad"
                                    />
                                )}
                                name="phone"
                            />

                            <Controller
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Email"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.email}
                                        disabled={!editMode}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                )}
                                name="email"
                            />
                        </View>

                        {editMode && (
                            <Button
                                mode="contained"
                                onPress={handleSubmit(onSubmit)}
                                style={styles.saveButton}
                                loading={saving}
                                disabled={saving}
                            >
                                Save Changes
                            </Button>
                        )}
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Title style={styles.cardTitle}>Company Images</Title>
                        {editMode && (
                            <Button
                                mode="text"
                                onPress={pickImage}
                                icon="image-plus"
                            >
                                Add Image
                            </Button>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    {images.length === 0 ? (
                        <View style={styles.emptyImagesContainer}>
                            <MaterialCommunityIcons name="image-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyImagesText}>No company images yet</Text>
                            {editMode && (
                                <Text style={styles.emptyImagesSubtext}>
                                    Add images to showcase your company
                                </Text>
                            )}
                        </View>
                    ) : (
                        <ScrollView horizontal style={styles.imagesScrollView}>
                            {images.map((image, index) => (
                                <View key={index} style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: image.uri || image.url }}
                                        style={styles.companyImage}
                                    />
                                    {editMode && (
                                        <IconButton
                                            icon="close-circle"
                                            size={20}
                                            color="#fff"
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(index)}
                                        />
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Verification Documents</Title>

                    <Divider style={styles.divider} />

                    {verificationDocuments.length === 0 ? (
                        <View style={styles.emptyDocumentsContainer}>
                            <MaterialCommunityIcons name="file-document-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyDocumentsText}>No verification documents</Text>
                            <Text style={styles.emptyDocumentsSubtext}>
                                Upload documents to verify your company
                            </Text>
                            <Button
                                mode="outlined"
                                onPress={pickVerificationDocument}
                                style={styles.uploadDocumentButton}
                                icon="file-upload"
                            >
                                Upload Document
                            </Button>
                        </View>
                    ) : (
                        <View>
                            {verificationDocuments.map((doc, index) => (
                                <View key={index} style={styles.documentItem}>
                                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#F44336" />
                                    <View style={styles.documentInfo}>
                                        <Text style={styles.documentName}>{doc.document_name}</Text>
                                        <Text style={styles.documentStatus}>
                                            Status: {doc.status === 'approved' ? 'Approved' :
                                                doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                                        </Text>
                                        <Text style={styles.documentDate}>
                                            Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <IconButton
                                        icon="eye"
                                        size={20}
                                        onPress={() => Linking.openURL(doc.document)}
                                    />
                                </View>
                            ))}
                            <Button
                                mode="outlined"
                                onPress={pickVerificationDocument}
                                style={styles.uploadMoreButton}
                                icon="file-upload"
                            >
                                Upload More
                            </Button>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    logo: {
        marginRight: 20,
    },
    editLogoIcon: {
        position: 'absolute',
        bottom: 0,
        right: 20,
        backgroundColor: '#1E88E5',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    verificationText: {
        marginLeft: 5,
        fontSize: 12,
    },
    verificationCard: {
        margin: 10,
        backgroundColor: '#e3f2fd',
    },
    verificationCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    verificationCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    verificationCardText: {
        marginBottom: 15,
    },
    verificationButton: {
        marginTop: 10,
    },
    card: {
        margin: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
    },
    divider: {
        marginVertical: 15,
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
    saveButton: {
        marginTop: 10,
    },
    imagesScrollView: {
        flexDirection: 'row',
    },
    imageContainer: {
        position: 'relative',
        marginRight: 10,
    },
    companyImage: {
        width: 200,
        height: 120,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    emptyImagesContainer: {
        alignItems: 'center',
        padding: 20,
    },
    emptyImagesText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    emptyImagesSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    emptyDocumentsContainer: {
        alignItems: 'center',
        padding: 20,
    },
    emptyDocumentsText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    emptyDocumentsSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        marginBottom: 15,
    },
    uploadDocumentButton: {
        marginTop: 10,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 10,
    },
    documentInfo: {
        flex: 1,
        marginLeft: 10,
    },
    documentName: {
        fontWeight: 'bold',
    },
    documentStatus: {
        fontSize: 12,
        color: '#666',
    },
    documentDate: {
        fontSize: 12,
        color: '#999',
    },
    uploadMoreButton: {
        marginTop: 10,
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

export default CompanyProfileScreen;