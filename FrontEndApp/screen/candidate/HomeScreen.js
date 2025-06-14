import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
// Remove the LinearGradient import temporarily
import { Avatar, Chip, Searchbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import FilterModal from "../../components/FilterModal";
import AppButton from "../../components/ui/AppButton";
import { AuthContext } from "../../contexts/AuthContext";
import { JobContext } from "../../contexts/JobContext";

const HomeScreen = ({ navigation }) => {
  
  const { updateFilters, filters, fetchJobsByPage } = useContext(JobContext);
  const { user } = useContext(AuthContext);
  const username = useMemo(() => user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "Người dùng", [user]);
  
  // Thêm console.log để kiểm tra user
  console.log("Current user:", user);
  
  // State for lazy loading
  const [jobList, setJobList] = useState([]);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const pageSize = 10; // Số lượng job mỗi trang, chỉnh theo backend
  const scrollY = new Animated.Value(0);
  const isFirstLoad = useRef(true);

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
  

  // Thay thế logic phân trang bằng hàm context
  const loadJobsByPage = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setIsInitialLoading(true);
        setHasMore(true);
        setPage(1);
        setJobList([]);
      }
      if (!hasMore && !reset) return;
      setIsFetchingMore(true);
      const data = await fetchJobsByPage({ page: pageNum, page_size: pageSize });
      if (data && Array.isArray(data.results)) {
        setJobList(prev => (pageNum === 1 ? data.results : [...prev, ...data.results]));
        setHasMore(!!data.next);
        setPage(pageNum);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
      if (reset) setIsInitialLoading(false);
    }
  };

  // Initial load & when filters change
  useEffect(() => {
    loadJobsByPage(1, true);
  }, [filters]);

  // Initial load on mount
  useEffect(() => {
    if (isFirstLoad.current) {
      loadJobsByPage(1, true);
      isFirstLoad.current = false;
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobsByPage(1, true);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isFetchingMore && hasMore) {
      loadJobsByPage(page + 1);
    }
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
            <Icon name="location-on" size={16} color="#1E88E5" />
            <Text style={styles.tagText}>{item.location}</Text>
          </View>
          <View style={styles.tag}>
            <Icon name="attach-money" size={16} color="#1E88E5" />
            <Text style={styles.tagText}>{Number(item.salary).toLocaleString('vi-VN')} VNĐ</Text>
          </View>
          <View style={styles.tag}>
            <Icon name="access-time" size={16} color="#1E88E5" />
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
                onPress={() => navigation.navigate("JobDetail", { jobId: item.id, companyId: item.company?.id })}>
                Chi tiết
              </AppButton>
              <AppButton
                mode="contained"
                style={styles.applyButton}
                icon="send"
                onPress={() => navigation.navigate("ApplyScreen", { jobId: item.id })}
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
      {/* Replace LinearGradient with a regular View */}
      <View style={styles.header}>
        <Animated.View style={[styles.headerContent, { height: headerHeight }]}>
          <Text style={styles.greeting} numberOfLines={1}>Xin chào{user ? `, ${username}!` : '!'}</Text>
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
          icon={() => <Icon name="search" size={24} color="#1E88E5" />}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={24} color="#1E88E5" />
        </TouchableOpacity>
      </Animated.View>

      {jobList.length === 0 && isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.loadingText}>Đang tải danh sách việc làm...</Text>
        </View>
      ) : jobList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Không tìm thấy công việc phù hợp</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={jobList}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#1E88E5']}
              />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.2}
            ListFooterComponent={isFetchingMore && hasMore ? (
              <View style={{ padding: 16 }}>
                <ActivityIndicator size="small" color="#1E88E5" />
              </View>
            ) : null}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />
        </>
      )}

      <FilterModal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        initialFilters={filters}
        onApply={(newFilters) => {
          updateFilters(newFilters);
          setFilterModalVisible(false);
        }}
        onReset={() => {
          updateFilters({
            specialized: '',
            salary_min: '',
            salary_max: '',
            working_hours_min: '',
            working_hours_max: '',
            location: '',
            search: searchQuery,
            ordering: '-created_date'
          });
          setFilterModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 50, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    backgroundColor: '#1E88E5', 
    zIndex: 1, 
    paddingBottom: 30,
    minHeight: 110,
  },
  headerDebugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  headerDebugText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  greeting: {
    fontSize: 30, // Slightly reduced to ensure it fits
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#E3F2FD',
    letterSpacing: 0.3,
    opacity: 0.95,
  },
  searchContainer: {
    marginTop: -25,
    marginHorizontal: 20,
    marginBottom: 15, // Increased to provide more space
    zIndex: 2, // Ensure search bar appears above other elements
    flexDirection: 'row', // Added to align search bar and filter button
    alignItems: 'center', // Center align items
  },
  searchBar: {
    elevation: 10,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    height: 50,
    flex: 1, // Added to take available space
  },
  searchInput: {
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10, // Added margin to separate from search bar
    padding: 10, // Added padding for better touch area
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  categoriesContainer: {
    marginVertical: 15, // Adjusted for better spacing
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingVertical: 8, // Added vertical padding
  },
  categoryChip: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    borderColor: '#E0E0E0',
    height: 42,
  },
  selectedCategoryChip: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
    transform: [{scale: 1.05}],
  },
  categoryChipText: {
    color: '#1E88E5',
    fontWeight: '600',
    fontSize: 15,
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    transform: [{translateY: 0}],
    borderColor: '#F0F0F0',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to prevent text compression
    marginBottom: 16,
  },
  companyLogo: {
    marginRight: 12,
    alignSelf: 'flex-start', // Aligned to top
  },
  avatar: {
    backgroundColor: '#E3F2FD',
  },
  headerInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20, // Slightly reduced for better fit
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  companyName: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 4, // Added to prevent overlap when wrapped
  },
  tagText: {
    fontSize: 14,
    color: '#1E88E5',
    marginLeft: 6,
    fontWeight: '500',
  },
  specializedContainer: {
    marginVertical: 10,
  },
  specializedChip: {
    backgroundColor: '#E8F4FD',
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingVertical: 4, // Added for better text visibility
  },
  specializedText: {
    color: '#0277BD',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
  },
  viewButton: {
    flex: 1,
    borderRadius: 14,
    borderColor: '#1E88E5',
    borderWidth: 2,
    elevation: 2,
  },
  viewButtonText: {
    color: '#1E88E5',
    fontWeight: 'bold',
    fontSize: 15,
  },
  applyButton: {
    flex: 2,
    borderRadius: 14,
    backgroundColor: '#1E88E5',
    elevation: 4,
  },
  loginButton: {
    flex: 2,
    borderRadius: 14,
    backgroundColor: '#1E88E5',
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingBottom: 50, // Added to center content better
  },
  loadingText: {
    marginTop: 16,
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F7FA',
  },  emptyText: {
    fontSize: 18,
    color: '#424242',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 26,
  },
});

export default HomeScreen;
