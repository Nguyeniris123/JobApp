import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Animated, FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Chip, Searchbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import AppButton from "../../components/ui/AppButton";
import { AuthContext } from "../../contexts/AuthContext";
import { JobContext } from "../../contexts/JobContext";

const HomeScreen = ({ navigation }) => {
  const { loading, jobs, fetchJobs, updateFilters } = useContext(JobContext);
  const { user } = useContext(AuthContext);
  
  // Thêm console.log để kiểm tra user
  console.log("Current user:", user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 0],
    extrapolate: 'clamp',
  });

  const searchPaddingTop = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [16, 0],
    extrapolate: 'clamp',
  });

  const categories = [
    { id: 'all', label: 'Tất cả', icon: 'apps' },
    { id: 'tech', label: 'Công nghệ', icon: 'computer' },
    { id: 'service', label: 'Dịch vụ', icon: 'room-service' },
    { id: 'office', label: 'Văn phòng', icon: 'business-center' },
    { id: 'education', label: 'Giáo dục', icon: 'school' },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSearch = useCallback(
    debounce(async (query) => {
      await updateFilters({ search: query });
    }, 500),
    []
  );

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const renderJobItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.companyLogo}>
            <Avatar.Icon size={50} icon="briefcase" style={styles.avatar} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.companyName}>{item.company?.name || 'Company'}</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.tagText}>{item.location}</Text>
          </View>
          <View style={styles.tag}>
            <Icon name="attach-money" size={16} color="#666" />
            <Text style={styles.tagText}>{Number(item.salary).toLocaleString('vi-VN')} VNĐ</Text>
          </View>
          <View style={styles.tag}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.tagText}>{item.working_hours}</Text>
          </View>
        </View>

        <View style={styles.specializedContainer}>
          <Chip
            icon="star"
            textStyle={styles.specializedText}
            style={styles.specializedChip}
          >
            {item.specialized}
          </Chip>
        </View>

        <View style={styles.buttonRow}>
          {user ? (
            <>
              <AppButton
                mode="outlined"
                style={styles.viewButton}
                labelStyle={styles.viewButtonText}
                onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}>
                Chi tiết
              </AppButton>
              <AppButton
                mode="contained"
                style={styles.applyButton}
                icon="send"
                onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}
              >
                Ứng tuyển
              </AppButton>
            </>
          ) : (
            <>
              <AppButton
                mode="outlined"
                style={styles.viewButton}
                labelStyle={styles.viewButtonText}
                onPress={() => navigation.navigate("Login", { jobId: item.id })}>
                Chi tiết
              </AppButton>
              <AppButton
                mode="contained"
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
              >
                Đăng nhập
              </AppButton>
            </>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.headerContent, { height: headerHeight }]}>
          <Text style={styles.greeting}>Xin chào{user ? `, ${user.name}!` : '!'}</Text>
          <Text style={styles.subtitle}>Tìm việc làm phù hợp với bạn</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.searchContainer, { paddingTop: searchPaddingTop }]}>
        <Searchbar
          placeholder="Tìm kiếm công việc..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon={() => <Icon name="search" size={24} color="#666" />}
        />
      </Animated.View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {categories.map(category => (
            <Chip
              key={category.id}
              mode="outlined"
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.selectedCategoryChipText
              ]}
              icon={() => (
                <Icon
                  name={category.icon}
                  size={18}
                  color={selectedCategory === category.id ? '#fff' : '#666'}
                />
              )}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.loadingText}>Đang tải danh sách việc làm...</Text>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Không tìm thấy công việc phù hợp</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E88E5']}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#1E88E5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    opacity: 0.9,
  },
  searchContainer: {
    marginTop: -25,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    elevation: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoriesContainer: {
    marginVertical: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCategoryChip: {
    backgroundColor: '#1E88E5',
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#1E88E5',
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  viewButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#1E88E5',
    borderWidth: 2,
  },
  viewButtonText: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 2,
    borderRadius: 12,
    backgroundColor: '#1E88E5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#1E88E5',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFF',
  },
  emptyText: {
    fontSize: 18,
    color: '#424242',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});

export default HomeScreen;
