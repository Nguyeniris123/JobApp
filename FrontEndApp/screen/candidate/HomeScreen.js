import { useContext, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Chip, Divider, Searchbar, Text } from "react-native-paper";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import { AuthContext } from "../../contexts/AuthContext"; // Thêm context kiểm tra đăng nhập
import { JobContext } from "../../contexts/JobContext";

const HomeScreen = ({ navigation }) => {
  const { state, fetchJobs, searchJobs, setFilters, clearFilters } = useContext(JobContext);
  const { user } = useContext(AuthContext); // Kiểm tra trạng thái đăng nhập
  const { filteredJobs, loading } = state;

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ["Tất cả", "Bán hàng", "Giáo dục", "Dịch vụ", "IT", "Marketing"];

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    searchJobs(query);
  };

  const handleCategorySelect = (category) => {
    if (category === "Tất cả" || category === selectedCategory) {
      setSelectedCategory(null);
      clearFilters();
    } else {
      setSelectedCategory(category);
      setFilters({ category });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "applied": return "#1E88E5";
      case "pending": return "#FFA000";
      case "rejected": return "#D32F2F";
      default: return "#757575";
    }
  };

  const renderJobItem = ({ item }) => (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <Avatar.Image size={40} source={{ uri: item.company.logo }} />
        <View style={styles.headerInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.companyName}>{item.company.name}</Text>
        </View>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>📍 {item.location}</Text>
        <Text style={styles.detailText}>💰 {item.salary}</Text>
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
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào!</Text>
        <Text style={styles.subtitle}>Tìm việc làm bán thời gian phù hợp với bạn</Text>
      </View>

      <Searchbar
        placeholder="Tìm kiếm công việc..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              selected={item === selectedCategory}
              onPress={() => handleCategorySelect(item)}
              style={styles.categoryChip}
              selectedColor="#1E88E5"
            >
              {item}
            </Chip>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      ) : filteredJobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy công việc phù hợp</Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    padding: 20,
    paddingTop: 40,
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
  searchBar: {
    margin: 16,
    elevation: 2,
    borderRadius: 8,
    marginTop: -20,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
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
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 14,
    color: "#757575",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#424242",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default HomeScreen;
