import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Text, TextInput } from 'react-native-paper';

export const ReviewForm = ({ onSubmit, onCancel, initialValues = {} }) => {
    const [rating, setRating] = useState(initialValues.rating || 0);
    const [comment, setComment] = useState(initialValues.comment || '');
    const [newStrength, setNewStrength] = useState('');
    const [newWeakness, setNewWeakness] = useState('');
    const [strengths, setStrengths] = useState(initialValues.strengths || []);
    const [weaknesses, setWeaknesses] = useState(initialValues.weaknesses || []);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (rating === 0) {
            setError('Vui lòng chọn đánh giá sao');
            return;
        }

        if (!comment.trim()) {
            setError('Vui lòng nhập nhận xét');
            return;
        }

        onSubmit({
            rating,
            comment,
            strengths,
            weaknesses
        });
    };

    const addStrength = () => {
        if (newStrength.trim()) {
            setStrengths([...strengths, newStrength.trim()]);
            setNewStrength('');
        }
    };

    const removeStrength = (index) => {
        setStrengths(strengths.filter((_, i) => i !== index));
    };

    const addWeakness = () => {
        if (newWeakness.trim()) {
            setWeaknesses([...weaknesses, newWeakness.trim()]);
            setNewWeakness('');
        }
    };

    const removeWeakness = (index) => {
        setWeaknesses(weaknesses.filter((_, i) => i !== index));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đánh giá của bạn</Text>

            {/* Rating Stars */}
            <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialCommunityIcons
                        key={star}
                        name={star <= rating ? "star" : "star-outline"}
                        size={32}
                        color={star <= rating ? "#FFC107" : "#BDBDBD"}
                        style={styles.star}
                        onPress={() => {
                            setRating(star);
                            setError('');
                        }}
                    />
                ))}
            </View>

            {/* Comment Input */}
            <TextInput
                label="Nhận xét"
                value={comment}
                onChangeText={(text) => {
                    setComment(text);
                    setError('');
                }}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.commentInput}
                error={error && !comment.trim()}
            />

            {/* Strengths */}
            <View style={styles.tagsSection}>
                <Text style={styles.sectionTitle}>Điểm mạnh</Text>
                <View style={styles.addTagRow}>
                    <TextInput
                        label="Thêm điểm mạnh"
                        value={newStrength}
                        onChangeText={setNewStrength}
                        mode="outlined"
                        style={styles.tagInput}
                        dense
                    />
                    <Button
                        mode="contained"
                        onPress={addStrength}
                        disabled={!newStrength.trim()}
                        style={styles.addButton}
                        labelStyle={styles.buttonLabel}
                    >
                        Thêm
                    </Button>
                </View>
                <View style={styles.chipContainer}>
                    {strengths.map((strength, index) => (
                        <Chip
                            key={index}
                            style={styles.strengthChip}
                            onClose={() => removeStrength(index)}
                        >
                            {strength}
                        </Chip>
                    ))}
                </View>
            </View>

            {/* Weaknesses */}
            <View style={styles.tagsSection}>
                <Text style={styles.sectionTitle}>Điểm yếu</Text>
                <View style={styles.addTagRow}>
                    <TextInput
                        label="Thêm điểm yếu"
                        value={newWeakness}
                        onChangeText={setNewWeakness}
                        mode="outlined"
                        style={styles.tagInput}
                        dense
                    />
                    <Button
                        mode="contained"
                        onPress={addWeakness}
                        disabled={!newWeakness.trim()}
                        style={styles.addButton}
                        labelStyle={styles.buttonLabel}
                    >
                        Thêm
                    </Button>
                </View>
                <View style={styles.chipContainer}>
                    {weaknesses.map((weakness, index) => (
                        <Chip
                            key={index}
                            style={styles.weaknessChip}
                            onClose={() => removeWeakness(index)}
                        >
                            {weakness}
                        </Chip>
                    ))}
                </View>
            </View>

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={onCancel}
                    style={styles.cancelButton}
                >
                    Hủy
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                >
                    Gửi đánh giá
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    star: {
        marginHorizontal: 4,
    },
    commentInput: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    tagsSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#424242',
    },
    addTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tagInput: {
        flex: 1,
        marginRight: 8,
        backgroundColor: '#fff',
    },
    addButton: {
        height: 40,
        justifyContent: 'center',
    },
    buttonLabel: {
        fontSize: 12,
        marginVertical: 0,
        marginHorizontal: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    strengthChip: {
        backgroundColor: '#E8F5E9',
        margin: 2,
    },
    weaknessChip: {
        backgroundColor: '#FFEBEE',
        margin: 2,
    },
    errorText: {
        color: '#D32F2F',
        marginBottom: 12,
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    cancelButton: {
        marginRight: 8,
        borderColor: '#757575',
    },
    submitButton: {
        backgroundColor: '#1976D2',
    }
});