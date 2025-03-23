import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, Chip, Title, Divider } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';

const FilterModal = ({ visible, onDismiss, onApply, onReset, filters, skills }) => {
  const [selectedSkills, setSelectedSkills] = useState(filters.skills || []);

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      location: filters.location || '',
      minSalary: filters.minSalary ? filters.minSalary.toString() : '',
      maxSalary: filters.maxSalary ? filters.maxSalary.toString() : '',
      workingHours: filters.workingHours || '',
    }
  });

  // Update form when filters change
  useEffect(() => {
    setValue('location', filters.location || '');
    setValue('minSalary', filters.minSalary ? filters.minSalary.toString() : '');
    setValue('maxSalary', filters.maxSalary ? filters.maxSalary.toString() : '');
    setValue('workingHours', filters.workingHours || '');
    setSelectedSkills(filters.skills || []);
  }, [filters, setValue]);

  const onSubmit = (data) => {
    onApply({
      ...data,
      minSalary: data.minSalary ? parseFloat(data.minSalary) : '',
      maxSalary: data.maxSalary ? parseFloat(data.maxSalary) : '',
      skills: selectedSkills,
    });
  };

  const handleReset = () => {
    reset({
      location: '',
      minSalary: '',
      maxSalary: '',
      workingHours: '',
    });
    setSelectedSkills([]);
    onReset();
  };

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <ScrollView>
          <Title style={styles.title}>Filter Jobs</Title>

          <Text style={styles.sectionTitle}>Location</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Location"
                mode="outlined"
                placeholder="Enter city or area"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="location"
          />

          <Text style={styles.sectionTitle}>Salary Range</Text>
          <View style={styles.row}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Min Salary"
                  mode="outlined"
                  placeholder="Min $"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                  left={<TextInput.Affix text="$" />}
                />
              )}
              name="minSalary"
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Max Salary"
                  mode="outlined"
                  placeholder="Max $"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                  left={<TextInput.Affix text="$" />}
                />
              )}
              name="maxSalary"
            />
          </View>

          <Text style={styles.sectionTitle}>Working Hours</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Working Hours"
                mode="outlined"
                placeholder="e.g. Evenings, Weekends"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="workingHours"
          />

          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {skills.map(skill => (
              <Chip
                key={skill.id}
                selected={selectedSkills.includes(skill.id)}
                onPress={() => toggleSkill(skill.id)}
                style={styles.skillChip}
                selectedColor="#fff"
                mode={selectedSkills.includes(skill.id) ? 'flat' : 'outlined'}
              >
                {skill.name}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.resetButton}
            >
              Reset
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.applyButton}
            >
              Apply Filters
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skillChip: {
    margin: 4,
  },
  divider: {
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetButton: {
    flex: 1,
    marginRight: 10,
  },
  applyButton: {
    flex: 1,
    marginLeft: 10,
  },
});

export default FilterModal;