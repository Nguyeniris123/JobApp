import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Linking, StyleSheet, View } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
import { Avatar, Chip, Dialog, Paragraph, Portal, Text, Title, useTheme } from 'react-native-paper';
import { API_URL } from '../../config';
import { AuthContext } from '../../contexts/AuthContext';

// Import components
import FormButton from '../../components/form/FormButton';
import ContentContainer from '../../components/layout/ContentContainer';
import ScreenContainer from '../../components/layout/ScreenContainer';
import ErrorState from '../../components/states/ErrorState';
import LoadingState from '../../components/states/LoadingState';
import AppButton from '../../components/ui/AppButton';
import AppCard from '../../components/ui/AppCard';
import AppDivider from '../../components/ui/AppDivider';

const JobDetailScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [cv, setCv] = useState(null);
  const { user } = useContext(AuthContext);
  const theme = useTheme();

  const { control, handleSubmit } = useForm();

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/jobs/${jobId}/`);
      setJob(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/applications/`, {
        params: { job: jobId, applicant: user.id }
      });

      if (response.data.length > 0) {
        setApplicationStatus(response.data[0].status);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = () => {
    setDialogVisible(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setCv({
          uri: result.uri,
          name: result.name,
          type: 'application/pdf',
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const submitApplication = async () => {
    if (!cv) {
      alert('Please upload your CV first');
      return;
    }

    try {
      setApplying(true);

      const formData = new FormData();
      formData.append('job', jobId);
      formData.append('cv', cv);

      const response = await axios.post(`${API_URL}/api/applications/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setApplicationStatus('pending');
      setDialogVisible(false);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const startChat = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/chat-rooms/`, {
        job: jobId,
      });

      navigation.navigate('ChatDetail', { roomId: response.data.id });
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const saveJob = async () => {
    try {
      await axios.post(`${API_URL}/api/saved-jobs/`, {
        job: jobId,
      });
      alert('Job saved successfully!');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  const followCompany = async () => {
    try {
      await axios.post(`${API_URL}/api/follows/`, {
        company: job.company.id,
      });
      alert('Now following this company!');
    } catch (error) {
      console.error('Error following company:', error);
      alert('Failed to follow company. Please try again.');
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading job details..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState
          message={error}
          onRetry={fetchJobDetails}
          retryButtonText="Retry"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ContentContainer>
        <AppCard style={styles.headerCard}>
          <Title style={styles.jobTitle}>{job.title}</Title>

          <View style={styles.companyRow}>
            <Avatar.Image
              size={40}
              source={{ uri: job.company.logo || 'https://via.placeholder.com/40' }}
            />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{job.company.name}</Text>
              <View style={styles.verifiedRow}>
                <Text style={styles.companyLocation}>{job.location}</Text>
                {job.company.is_verified && (
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={14} color={theme.colors.primary} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {applicationStatus ? (
              <AppButton
                mode="contained"
                disabled={true}
                style={styles.appliedButton}
              >
                {applicationStatus === 'pending' ? 'Applied (Pending)' :
                  applicationStatus === 'accepted' ? 'Application Accepted' : 'Application Rejected'}
              </AppButton>
            ) : (
              <AppButton
                mode="contained"
                onPress={handleApply}
                style={styles.applyButton}
                icon="send"
              >
                Apply Now
              </AppButton>
            )}

            <View style={styles.iconButtonsRow}>
              <AppButton
                mode="text"
                icon="chat-outline"
                onPress={startChat}
                compact
              />
              <AppButton
                mode="text"
                icon="bookmark-outline"
                onPress={saveJob}
                compact
              />
              <AppButton
                mode="text"
                icon="bell-outline"
                onPress={followCompany}
                compact
              />
              <AppButton
                mode="text"
                icon="share-variant"
                onPress={() => {
                  Linking.share({
                    title: job.title,
                    message: `Check out this job: ${job.title} at ${job.company.name}`,
                  });
                }}
                compact
              />
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.detailsCard}>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#666" />
              <View>
                <Text style={styles.detailLabel}>Salary</Text>
                <Text style={styles.detailValue}>${job.salary}/hr</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
              <View>
                <Text style={styles.detailLabel}>Working Hours</Text>
                <Text style={styles.detailValue}>{job.working_hours}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={20} color="#666" />
              <View>
                <Text style={styles.detailLabel}>Posted On</Text>
                <Text style={styles.detailValue}>
                  {new Date(job.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </AppCard>

        <AppCard>
          <Title style={styles.sectionTitle}>Job Description</Title>
          <Paragraph style={styles.description}>{job.description}</Paragraph>
        </AppCard>

        <AppCard>
          <Title style={styles.sectionTitle}>Required Skills</Title>
          <View style={styles.skillsContainer}>
            {job.skills && job.skills.map(skill => (
              <Chip key={skill.id} style={styles.skillChip}>
                {skill.name}
              </Chip>
            ))}
          </View>
        </AppCard>

        {/* {job.location_details && (
          <AppCard>
            <Title style={styles.sectionTitle}>Location</Title>
            <Text style={styles.locationText}>{job.location}</Text>

            {job.location_details.latitude && job.location_details.longitude && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: parseFloat(job.location_details.latitude),
                    longitude: parseFloat(job.location_details.longitude),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(job.location_details.latitude),
                      longitude: parseFloat(job.location_details.longitude),
                    }}
                    title={job.company.name}
                    description={job.location}
                  />
                </MapView>
              </View>
            )}
          </AppCard>
        )} */}

        <AppCard>
          <Title style={styles.sectionTitle}>About the Company</Title>
          <View style={styles.companyDetailRow}>
            <Avatar.Image
              size={60}
              source={{ uri: job.company.logo || 'https://via.placeholder.com/60' }}
            />
            <View style={styles.companyDetailInfo}>
              <Text style={styles.companyDetailName}>{job.company.name}</Text>
              <AppButton
                mode="text"
                onPress={() => navigation.navigate('CompanyDetail', { companyId: job.company.id })}
                style={styles.viewProfileButton}
              >
                View Company Profile
              </AppButton>
            </View>
          </View>
          <AppDivider />
          <Paragraph>{job.company.description}</Paragraph>
        </AppCard>

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>Apply for this job</Dialog.Title>
            <Dialog.Content>
              <Paragraph style={styles.dialogText}>
                Upload your CV to apply for this position at {job?.company?.name}.
              </Paragraph>

              <AppButton
                mode="outlined"
                onPress={pickDocument}
                style={styles.uploadButton}
                icon="file-upload"
              >
                {cv ? 'Change CV' : 'Upload CV'}
              </AppButton>

              {cv && (
                <View style={styles.fileRow}>
                  <MaterialCommunityIcons name="file-pdf-box" size={24} color={theme.colors.primary} />
                  <Text style={styles.fileName} numberOfLines={1}>{cv.name}</Text>
                </View>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <AppButton mode="text" onPress={() => setDialogVisible(false)}>Cancel</AppButton>
              <FormButton
                onPress={submitApplication}
                loading={applying}
                disabled={applying || !cv}
                style={styles.submitButton}
              >
                Submit Application
              </FormButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ContentContainer>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: 10,
    elevation: 4,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  companyInfo: {
    marginLeft: 10,
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyLocation: {
    color: '#666',
    fontSize: 14,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: '#1976d2',
    marginLeft: 2,
  },
  actionButtons: {
    marginTop: 10,
  },
  applyButton: {
    marginBottom: 10,
  },
  appliedButton: {
    marginBottom: 10,
    backgroundColor: '#4caf50',
  },
  iconButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailsCard: {
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    margin: 4,
  },
  locationText: {
    marginBottom: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  companyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  companyDetailInfo: {
    marginLeft: 15,
    flex: 1,
  },
  companyDetailName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewProfileButton: {
    margin: 0,
    padding: 0,
  },
  dialogText: {
    marginBottom: 20,
  },
  uploadButton: {
    marginTop: 10,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  fileName: {
    marginLeft: 10,
    flex: 1,
  },
  submitButton: {
    marginTop: 0,
  },
});

export default JobDetailScreen;