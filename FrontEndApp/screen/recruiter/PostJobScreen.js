// "use client"

// import DateTimePicker from "@react-native-community/datetimepicker"
// import { useState } from "react"
// import { Alert, ScrollView, StyleSheet, View } from "react-native"
// import { Button, Chip, Divider, HelperText, Switch, Text, TextInput } from "react-native-paper"

// const PostJobScreen = ({ navigation }) => {
//     const [title, setTitle] = useState("")
//     const [description, setDescription] = useState("")
//     const [location, setLocation] = useState("")
//     const [salary, setSalary] = useState("")
//     const [category, setCategory] = useState("")
//     const [type, setType] = useState("")
//     const [hours, setHours] = useState("")
//     const [requirements, setRequirements] = useState("")
//     const [benefits, setBenefits] = useState("")
//     const [deadline, setDeadline] = useState(new Date())
//     const [showDatePicker, setShowDatePicker] = useState(false)
//     const [urgent, setUrgent] = useState(false)
//     const [loading, setLoading] = useState(false)

//     // Mock data for categories and job types
//     const categories = ["Bán hàng", "Giáo dục", "Dịch vụ", "IT", "Marketing", "Kế toán", "Khác"]
//     const jobTypes = ["Bán thời gian", "Toàn thời gian", "Thực tập", "Theo dự án", "Theo ca"]

//     const handleDateChange = (event, selectedDate) => {
//         const currentDate = selectedDate || deadline
//         setShowDatePicker(false)
//         setDeadline(currentDate)
//     }

//     const formatDate = (date) => {
//         return date.toLocaleDateString("vi-VN", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//         })
//     }

//     const validateForm = () => {
//         if (!title || !description || !location || !salary || !category || !type || !hours || !requirements || !benefits) {
//             Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc")
//             return false
//         }
//         return true
//     }

//     const handleSubmit = () => {
//         if (!validateForm()) return

//         setLoading(true)

//         // Simulate API call
//         setTimeout(() => {
//             setLoading(false)
//             Alert.alert("Thành công", "Tin tuyển dụng đã được đăng thành công", [
//                 {
//                     text: "OK",
//                     onPress: () => navigation.goBack(),
//                 },
//             ])
//         }, 2000)
//     }

//     return (
//         <ScrollView style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={styles.title}>Đăng tin tuyển dụng</Text>
//             </View>

//             <View style={styles.form}>
//                 <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

//                 <TextInput
//                     label="Tiêu đề công việc *"
//                     value={title}
//                     onChangeText={setTitle}
//                     mode="outlined"
//                     style={styles.input}
//                 />

//                 <TextInput
//                     label="Mô tả công việc *"
//                     value={description}
//                     onChangeText={setDescription}
//                     mode="outlined"
//                     multiline
//                     numberOfLines={5}
//                     style={styles.input}
//                 />

//                 <TextInput
//                     label="Địa điểm làm việc *"
//                     value={location}
//                     onChangeText={setLocation}
//                     mode="outlined"
//                     style={styles.input}
//                 />

//                 <TextInput
//                     label="Mức lương (VNĐ) *"
//                     value={salary}
//                     onChangeText={setSalary}
//                     mode="outlined"
//                     keyboardType="numeric"
//                     style={styles.input}
//                 />

//                 <Text style={styles.inputLabel}>Danh mục công việc *</Text>
//                 <View style={styles.chipContainer}>
//                     {categories.map((item, index) => (
//                         <Chip
//                             key={index}
//                             selected={category === item}
//                             onPress={() => setCategory(item)}
//                             style={styles.chip}
//                             selectedColor="#1E88E5"
//                         >
//                             {item}
//                         </Chip>
//                     ))}
//                 </View>

//                 <Text style={styles.inputLabel}>Loại công việc *</Text>
//                 <View style={styles.chipContainer}>
//                     {jobTypes.map((item, index) => (
//                         <Chip
//                             key={index}
//                             selected={type === item}
//                             onPress={() => setType(item)}
//                             style={styles.chip}
//                             selectedColor="#1E88E5"
//                         >
//                             {item}
//                         </Chip>
//                     ))}
//                 </View>

//                 <TextInput
//                     label="Thời gian làm việc *"
//                     value={hours}
//                     onChangeText={setHours}
//                     mode="outlined"
//                     placeholder="Ví dụ: 20 giờ/tuần, 9:00-17:00"
//                     style={styles.input}
//                 />

//                 <Divider style={styles.divider} />

//                 <Text style={styles.sectionTitle}>Yêu cầu và quyền lợi</Text>

//                 <TextInput
//                     label="Yêu cầu ứng viên *"
//                     value={requirements}
//                     onChangeText={setRequirements}
//                     mode="outlined"
//                     multiline
//                     numberOfLines={5}
//                     placeholder="Mỗi yêu cầu một dòng"
//                     style={styles.input}
//                 />
//                 <HelperText type="info">Mỗi yêu cầu viết trên một dòng</HelperText>

//                 <TextInput
//                     label="Quyền lợi *"
//                     value={benefits}
//                     onChangeText={setBenefits}
//                     mode="outlined"
//                     multiline
//                     numberOfLines={5}
//                     placeholder="Mỗi quyền lợi một dòng"
//                     style={styles.input}
//                 />
//                 <HelperText type="info">Mỗi quyền lợi viết trên một dòng</HelperText>

//                 <Divider style={styles.divider} />

//                 <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>

//                 <View style={styles.datePickerContainer}>
//                     <Text style={styles.inputLabel}>Hạn nộp hồ sơ *</Text>
//                     <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
//                         {formatDate(deadline)}
//                     </Button>
//                     {showDatePicker && (
//                         <DateTimePicker
//                             value={deadline}
//                             mode="date"
//                             display="default"
//                             onChange={handleDateChange}
//                             minimumDate={new Date()}
//                         />
//                     )}
//                 </View>

//                 <View style={styles.switchContainer}>
//                     <View style={styles.switchItem}>
//                         <Text style={styles.switchLabel}>Đánh dấu là tin khẩn cấp</Text>
//                         <Switch value={urgent} onValueChange={setUrgent} color="#1E88E5" />
//                     </View>
//                     <HelperText type="info">Tin khẩn cấp sẽ được ưu tiên hiển thị và có thêm phí</HelperText>
//                 </View>

//                 <Button
//                     mode="contained"
//                     onPress={handleSubmit}
//                     style={styles.submitButton}
//                     loading={loading}
//                     disabled={loading}
//                 >
//                     Đăng tin
//                 </Button>
//             </View>
//         </ScrollView>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#FFFFFF",
//     },
//     header: {
//         padding: 20,
//         paddingTop: 40,
//         backgroundColor: "#1E88E5",
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: "bold",
//         color: "#FFFFFF",
//     },
//     form: {
//         padding: 16,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: "bold",
//         marginBottom: 16,
//         marginTop: 8,
//         color: "#212121",
//     },
//     input: {
//         marginBottom: 16,
//         backgroundColor: "#FFFFFF",
//     },
//     inputLabel: {
//         fontSize: 14,
//         color: "#757575",
//         marginBottom: 8,
//     },
//     chipContainer: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         marginBottom: 16,
//     },
//     chip: {
//         margin: 4,
//     },
//     divider: {
//         marginVertical: 16,
//     },
//     datePickerContainer: {
//         marginBottom: 16,
//     },
//     dateButton: {
//         marginTop: 8,
//     },
//     switchContainer: {
//         marginBottom: 24,
//     },
//     switchItem: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//     },
//     switchLabel: {
//         fontSize: 16,
//         color: "#212121",
//     },
//     submitButton: {
//         paddingVertical: 8,
//         marginBottom: 24,
//     },
// })

// export default PostJobScreen

