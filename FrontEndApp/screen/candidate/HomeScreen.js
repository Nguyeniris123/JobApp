import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Animated, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Avatar, Divider, Searchbar, Text } from "react-native-paper";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import { AuthContext } from "../../contexts/AuthContext";
import { JobContext } from "../../contexts/JobContext";

const HomeScreen = ({ navigation }) => {
  const { loading, jobs, fetchJobs } = useContext(JobContext);
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const renderJobItem = ({ item }) => (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <Avatar.Icon size={40} icon="briefcase" />
        <View style={styles.headerInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.specialized}>{item.specialized}</Text>
        </View>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>📍 {item.location}</Text>
        <Text style={styles.detailText}>💰 {Number(item.salary).toLocaleString('vi-VN')} VNĐ</Text>
        <Text style={styles.detailText}>⏰ {item.working_hours}</Text>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.buttonRow}>
        <AppButton
          mode="outlined"
          onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}
        >
          View Job
        </AppButton>
        {user ? (
          <AppButton mode="contained" icon="chat" onPress={() => { }}>
            Contact
          </AppButton>
        ) : (
          <AppButton mode="contained" onPress={() => navigation.navigate("Login")}>
            Login to Apply
          </AppButton>
        )}
      </View>
    </AppCard>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight, overflow: 'hidden' }]}>
        <Text style={styles.greeting}>Xin chào!</Text>
        <Text style={styles.subtitle}>Tìm việc làm bán thời gian phù hợp với bạn</Text>
      </Animated.View>

      <Animated.View style={[styles.searchContainer, { paddingTop: searchPaddingTop }]}>
        <Searchbar
          placeholder="Tìm kiếm công việc..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy công việc phù hợp</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    backgroundColor: "#F5F5F5",
  },
  header: {
    padding: 10,
    paddingTop: 20,
    backgroundColor: "#1E88E5",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#1E88E5',
    paddingBottom: 20,
  },
  searchBar: {
    elevation: 0,
    borderRadius: 8,
  },
  jobList: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  jobTitle: {
    fontSize: 16,
  },
  specialized: {
    fontSize: 14,
    color: '#666',
  },
  detailsRow: {
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 8,
  },
});

export default HomeScreen;
