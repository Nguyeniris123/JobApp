import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Modal, Portal, Text, TextInput, Title } from 'react-native-paper';

const FilterModal = ({ visible, onDismiss, onApply, onReset, initialFilters = {} }) => {
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      specialized: initialFilters.specialized || '',
      location: initialFilters.location || '',
      salary_min: initialFilters.salary_min || '',
      salary_max: initialFilters.salary_max || '',
      working_hours_min: initialFilters.working_hours_min || '',
      working_hours_max: initialFilters.working_hours_max || '',
      ordering: initialFilters.ordering || '-created_date'
    }
  });

  const orderingOptions = [
    { value: '-created_date', label: 'Mới nhất' },
    { value: 'created_date', label: 'Cũ nhất' },
    { value: '-salary', label: 'Lương cao đến thấp' },
    { value: 'salary', label: 'Lương thấp đến cao' }
  ];
  
  const [selectedOrdering, setSelectedOrdering] = useState(initialFilters.ordering || '-created_date');

  // Update form when filters change
  useEffect(() => {
    setValue('specialized', initialFilters.specialized || '');
    setValue('location', initialFilters.location || '');
    setValue('salary_min', initialFilters.salary_min || '');
    setValue('salary_max', initialFilters.salary_max || '');
    setValue('working_hours_min', initialFilters.working_hours_min || '');
    setValue('working_hours_max', initialFilters.working_hours_max || '');
    setSelectedOrdering(initialFilters.ordering || '-created_date');
  }, [initialFilters, setValue]);

  const onSubmit = (data) => {
    onApply({
      ...data,
      ordering: selectedOrdering
    });
  };

  const handleReset = () => {
    reset({
      specialized: '',
      location: '',
      salary_min: '',
      salary_max: '',
      working_hours_min: '',
      working_hours_max: '',
    });
    setSelectedOrdering('-created_date');
    onReset();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <ScrollView>
          <Title style={styles.title}>Tìm kiếm nâng cao</Title>

          <Text style={styles.sectionTitle}>Chuyên ngành</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Chuyên ngành"
                mode="outlined"
                placeholder="VD: Công nghệ thông tin, Kế toán..."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="specialized"
          />

          <Text style={styles.sectionTitle}>Vị trí</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Vị trí"
                mode="outlined"
                placeholder="VD: TP.HCM, Hà Nội..."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="location"
          />

          <Text style={styles.sectionTitle}>Mức lương (VNĐ)</Text>
          <View style={styles.row}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Lương tối thiểu"
                  mode="outlined"
                  placeholder="VD: 10000000"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                />
              )}
              name="salary_min"
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Lương tối đa"
                  mode="outlined" 
                  placeholder="VD: 20000000"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                />
              )}
              name="salary_max"
            />
          </View>

          <Text style={styles.sectionTitle}>Giờ làm việc</Text>
          <View style={styles.row}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Tối thiểu"
                  mode="outlined"
                  placeholder="VD: 8"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                />
              )}
              name="working_hours_min"
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Tối đa"
                  mode="outlined"
                  placeholder="VD: 10"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                />
              )}
              name="working_hours_max"
            />
          </View>

          <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
          <View style={styles.orderingContainer}>
            {orderingOptions.map(option => (
              <Chip
                key={option.value}
                selected={selectedOrdering === option.value}
                onPress={() => setSelectedOrdering(option.value)}
                style={styles.orderingChip}
                selectedColor={selectedOrdering === option.value ? '#fff' : '#1E88E5'}
                mode={selectedOrdering === option.value ? 'flat' : 'outlined'}
                backgroundColor={selectedOrdering === option.value ? '#1E88E5' : 'transparent'}
              >
                {option.label}
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
              Đặt lại
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.applyButton}
            >
              Áp dụng
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
  orderingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    gap: 8,
  },
  orderingChip: {
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
    backgroundColor: '#1E88E5',
  },
});

export default FilterModal;