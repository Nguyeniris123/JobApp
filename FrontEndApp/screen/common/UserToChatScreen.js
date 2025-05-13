import React, { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Avatar, Button, Divider, List, Searchbar, Text } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import ChatService from '../../services/ChatService';

/**
 * Màn hình hiển thị danh sách người dùng để bắt đầu trò chuyện
 */
const UserToChatScreen = ({ navigation }) => {
  const { user, role } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);

  // Tải danh sách người dùng dựa vào role hiện tại
  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Lấy danh sách người dùng từ API
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mẫu dữ liệu để thử nghiệm - trong môi trường thực, bạn sẽ lấy từ API
      const sampleUsers = [
        { id: 'user_' + Date.now() + '_1', name: 'Nguyễn Văn A', role: 'candidate', avatar: null },
        { id: 'user_' + Date.now() + '_2', name: 'Trần Thị B', role: 'recruiter', avatar: null },
        { id: 'user_' + Date.now() + '_3', name: 'Lê Văn C', role: 'candidate', avatar: null },
        { id: 'user_' + Date.now() + '_4', name: 'Phạm Thị D', role: 'recruiter', avatar: null },
      ];
      
      // Lọc các người dùng không trùng với người dùng hiện tại
      const filteredUsers = sampleUsers.filter(u => u.id !== user?.id);
      
      setUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  /**
   * Xử lý tìm kiếm người dùng
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  /**
   * Tạo phòng chat với người dùng đã chọn và điều hướng đến phòng chat đó
   */
  const handleStartChat = async (selectedUser) => {
    try {
      setProcessingUserId(selectedUser.id);
      
      let recruiterId, candidateId;
      
      // Xác định vai trò để tạo phòng chat
      if (role === 'recruiter') {
        recruiterId = user.id;
        candidateId = selectedUser.id;
      } else {
        recruiterId = selectedUser.id;
        candidateId = user.id;
      }
      
      // Tạo hoặc lấy phòng chat hiện có giữa hai người dùng
      const roomId = await ChatService.createOrGetChatRoom(recruiterId, candidateId);
      
      // Điều hướng đến màn hình SimpleTestChatScreen với ID phòng
      navigation.navigate('SimpleTestChatRoom', { roomId });
      
      setProcessingUserId(null);
    } catch (error) {
      console.error('Lỗi khi tạo phòng chat:', error);
      setError('Không thể tạo phòng chat. Vui lòng thử lại sau.');
      setProcessingUserId(null);
    }
  };

  /**
   * Render từng người dùng trong danh sách
   */
  const renderUserItem = ({ item }) => {
    const isProcessing = processingUserId === item.id;
    
    return (
      <React.Fragment>
        <List.Item
          title={item.name}
          description={`Vai trò: ${item.role === 'recruiter' ? 'Nhà tuyển dụng' : 'Ứng viên'}`}
          left={props => 
            <Avatar.Text 
              {...props} 
              size={50} 
              label={item.name.substring(0, 2).toUpperCase()} 
            />
          }
          right={props => 
            isProcessing ? (
              <ActivityIndicator {...props} size={24} color="#2196F3" style={{ marginRight: 16 }} />
            ) : (
              <Button 
                {...props} 
                mode="outlined" 
                icon="chat" 
                onPress={() => handleStartChat(item)}
                style={{ marginVertical: 8 }}
                labelStyle={{ fontSize: 12 }}
              >
                Chat
              </Button>
            )
          }
        />
        <Divider />
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Trò chuyện với người dùng" />
        <Appbar.Action icon="refresh" onPress={fetchUsers} />
      </Appbar.Header>
      
      <View style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button onPress={() => setError(null)} style={styles.dismissButton}>
              Đóng
            </Button>
          </View>
        )}
        
        <Searchbar
          placeholder="Tìm kiếm người dùng..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'Không tìm thấy người dùng nào phù hợp.' : 'Không có người dùng nào.'}
            </Text>
            <Button 
              mode="contained" 
              onPress={fetchUsers}
              style={styles.refreshButton}
            >
              Tải lại
            </Button>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#D32F2F",
    flex: 1,
  },
  dismissButton: {
    marginLeft: 8,
  },
  searchBar: {
    margin: 8,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#2196F3",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 20,
  },
  refreshButton: {
    marginTop: 8,
  },
  listContent: {
    flexGrow: 1,
  },
});

export default UserToChatScreen;
