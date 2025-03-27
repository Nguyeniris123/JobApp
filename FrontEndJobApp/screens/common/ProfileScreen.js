// screens/common/ProfileScreen.jsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Switch, Text, Title } from 'react-native-paper';

import FormField from '../../components/form/FormField.js';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppButton from '../../components/ui/AppButton';

const ProfileScreen = () => {
    // const { user, updateProfile, logout, loading: authLoading } = useContext(AuthContext);
    // const [loading, setLoading] = useState(false);
    // const [editMode, setEditMode] = useState(false);
    // const [avatar, setAvatar] = useState(null);
    // const [skills, setSkills] = useState([]);
    // const [availableSkills, setAvailableSkills] = useState([]);
    // const [notifications, setNotifications] = useState(true);
    // const theme = useTheme();

    // const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    //     defaultValues: {
    //         firstName: user?.first_name || '',
    //         lastName: user?.last_name || '',
    //         email: user?.email || '',
    //         phone: user?.phone || '',
    //         bio: user?.bio || '',
    //     }
    // });

    // useEffect(() => {
    //     if (user) {
    //         setValue('firstName', user.first_name || '');
    //         setValue('lastName', user.last_name || '');
    //         setValue('email', user.email || '');
    //         setValue('phone', user.phone || '');
    //         setValue('bio', user.bio || '');
    //         setAvatar(user.avatar);

    //         if (user.role === 'candidate') {
    //             fetchCandidateProfile();
    //             fetchAvailableSkills();
    //         }
    //     }
    // }, [user, setValue]);

    // const fetchCandidateProfile = async () => {
    //     try {
    //         const response = await axios.get(`${API_URL}/api/candidate-profiles/me/`);
    //         setSkills(response.data.skills || []);
    //     } catch (error) {
    //         console.error('Error fetching candidate profile:', error);
    //     }
    // };

    // const fetchAvailableSkills = async () => {
    //     try {
    //         const response = await axios.get(`${API_URL}/api/skills/`);
    //         setAvailableSkills(response.data);
    //     } catch (error) {
    //         console.error('Error fetching skills:', error);
    //     }
    // };

    // const pickImage = async () => {
    //     if (!editMode) return;

    //     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    //     if (permissionResult.granted === false) {
    //         alert('Permission to access camera roll is required!');
    //         return;
    //     }

    //     const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         aspect: [1, 1],
    //         quality: 0.5,
    //     });

    //     if (!result.cancelled) {
    //         setAvatar(result.uri);
    //     }
    // };

    // const toggleSkill = (skillId) => {
    //     if (!editMode) return;

    //     if (skills.some(s => s.id === skillId)) {
    //         setSkills(skills.filter(s => s.id !== skillId));
    //     } else {
    //         const skill = availableSkills.find(s => s.id === skillId);
    //         if (skill) {
    //             setSkills([...skills, skill]);
    //         }
    //     }
    // };

    // const onSubmit = async (data) => {
    //     try {
    //         setLoading(true);

    //         const formData = new FormData();
    //         formData.append('first_name', data.firstName);
    //         formData.append('last_name', data.lastName);
    //         formData.append('email', data.email);
    //         formData.append('phone', data.phone);
    //         formData.append('bio', data.bio);

    //         if (avatar && avatar !== user.avatar) {
    //             const filename = avatar.split('/').pop();
    //             const match = /\.(\w+)$/.exec(filename);
    //             const type = match ? `image/${match[1]}` : 'image';

    //             formData.append('avatar', {
    //                 uri: avatar,
    //                 name: filename,
    //                 type,
    //             });
    //         }

    //         await updateProfile(formData);

    //         if (user.role === 'candidate') {
    //             await axios.patch(`${API_URL}/api/candidate-profiles/me/`, {
    //                 skills: skills.map(s => s.id),
    //             });
    //         }

    //         setEditMode(false);
    //         alert('Profile updated successfully!');
    //     } catch (error) {
    //         console.error('Error updating profile:', error);
    //         alert('Failed to update profile. Please try again.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // if (authLoading) {
    //     return (
    //         <View style={styles.loadingContainer}>
    //             <ActivityIndicator size="large" color={theme.colors.primary} />
    //             <Text style={styles.loadingText}>Loading profile...</Text>
    //         </View>
    //     );
    // }

    return (
        <ScreenContainer>
            <ContentContainer style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={pickImage} disabled={!editMode}>
                    {avatar ? (
                        <Avatar.Image
                            size={100}
                            source={{ uri: avatar }}
                            style={styles.avatar}
                        />
                    ) : (
                        <Avatar.Icon
                            size={100}
                            icon="account"
                            style={styles.avatar}
                        />
                    )}
                    {editMode && (
                        <View style={styles.editAvatarIcon}>
                            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Title>{user?.first_name} {user?.last_name}</Title>
                    <Text>{user?.role === 'candidate' ? 'Job Seeker' :
                        user?.role === 'recruiter' ? 'Recruiter' : 'Admin'}</Text>
                    <Text>{user?.email}</Text>
                </View>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Title style={styles.cardTitle}>Personal Information</Title>
                        {!editMode ? (
                            <AppButton
                                mode="text"
                                onPress={() => setEditMode(true)}
                                icon="pencil"
                            >
                                Edit
                            </AppButton>
                        ) : (
                            <AppButton
                                mode="text"
                                onPress={() => setEditMode(false)}
                                icon="close"
                                color="red"
                            >
                                Cancel
                            </AppButton>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.formContainer}>
                        <View style={styles.row}>
                            <FormField
                                name="firstName"
                                control={control}
                                rules={{
                                    required: 'First name is required',
                                }}
                                label="First Name"
                                mode="outlined"
                                style={[styles.input, styles.halfInput]}
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                error={!!errors.firstName}
                                disabled={!editMode}
                            />

                            <Controller
                                control={control}
                                rules={{
                                    required: 'Last name is required',
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        label="Last Name"
                                        mode="outlined"
                                        style={[styles.input, styles.halfInput]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={!!errors.lastName}
                                        disabled={!editMode}
                                    />
                                )}
                                name="lastName"
                            />
                        </View>

                        <Controller
                            control={control}
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Email"
                                    mode="outlined"
                                    style={styles.input}
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

                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Phone"
                                    mode="outlined"
                                    style={styles.input}
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
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Bio"
                                    mode="outlined"
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={!!errors.bio}
                                    disabled={!editMode}
                                    multiline
                                    numberOfLines={4}
                                />
                            )}
                            name="bio"
                        />

                        {editMode && (
                            <AppButton
                                mode="contained"
                                onPress={handleSubmit(onSubmit)}
                                style={styles.saveButton}
                                loading={loading}
                                disabled={loading}
                            >
                                Save Changes
                            </AppButton>
                        )}
                    </View>
                </Card.Content>
            </Card>

            {user?.role === 'candidate' && (
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.cardHeader}>
                            <Title style={styles.cardTitle}>Skills</Title>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.skillsContainer}>
                            {availableSkills.map(skill => (
                                <TouchableOpacity
                                    key={skill.id}
                                    onPress={() => toggleSkill(skill.id)}
                                    disabled={!editMode}
                                >
                                    <View
                                        style={[
                                            styles.skillChip,
                                            skills.some(s => s.id === skill.id) ?
                                                styles.selectedSkill :
                                                styles.unselectedSkill
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.skillText,
                                                skills.some(s => s.id === skill.id) ?
                                                    styles.selectedSkillText :
                                                    styles.unselectedSkillText
                                            ]}
                                        >
                                            {skill.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card.Content>
                </Card>
            )}

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Settings</Title>

                    <Divider style={styles.divider} />

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingTitle}>Push Notifications</Text>
                            <Text style={styles.settingDescription}>Receive notifications about new jobs, messages, etc.</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            color={theme.colors.primary}
                        />
                    </View>

                    <Divider style={styles.itemDivider} />

                    <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('ChangePassword')}>
                        <Text style={styles.settingTitle}>Change Password</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>

                    <Divider style={styles.itemDivider} />

                    <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('PrivacySettings')}>
                        <Text style={styles.settingTitle}>Privacy Settings</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>
                </Card.Content>
            </Card>

            <AppButton
                mode="outlined"
                onPress={logout}
                style={styles.logoutButton}
                icon="logout"
                color="red"
            >
                Logout
            </AppButton>
        </ContentContainer>
        </ScreenContainer>
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
    avatar: {
        marginRight: 20,
    },
    editAvatarIcon: {
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
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    skillChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        margin: 5,
    },
    selectedSkill: {
        backgroundColor: '#1E88E5',
    },
    unselectedSkill: {
        backgroundColor: '#f0f0f0',
    },
    skillText: {
        fontSize: 14,
    },
    selectedSkillText: {
        color: '#fff',
    },
    unselectedSkillText: {
        color: '#333',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingTitle: {
        fontSize: 16,
    },
    settingDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    itemDivider: {
        marginVertical: 5,
    },
    logoutButton: {
        margin: 20,
        borderColor: 'red',
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

export default ProfileScreen;