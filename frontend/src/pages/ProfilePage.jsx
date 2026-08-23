import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, Row, Col, Typography, message, Divider } from 'antd';
import { UserOutlined, UploadOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) message.error('Chỉ được tải lên file ảnh!');
  if (!isLt2M) message.error('Ảnh phải nhỏ hơn 2MB!');
  return isImage && isLt2M ? false : Upload.LIST_IGNORE;
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
      const data = res.data?.result;
      if (data) {
        profileForm.setFieldsValue({
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
        });
        setAvatarUrl(data.avatarUrl || null);
        updateUser({ fullName: data.fullName, email: data.email, phoneNumber: data.phoneNumber, avatarUrl: data.avatarUrl });
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values) => {
    try {
      setSavingProfile(true);
      const res = await userService.updateProfile(values);
      const data = res.data?.result;
      if (data) {
        updateUser(data);
        message.success('Cập nhật thông tin thành công!');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadAvatar = async ({ file }) => {
    try {
      setUploadingAvatar(true);
      const res = await userService.uploadAvatar(file);
      const data = res.data?.result;
      if (data) {
        setAvatarUrl(data.avatarUrl || null);
        updateUser({ avatarUrl: data.avatarUrl });
        message.success('Cập nhật ảnh đại diện thành công!');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        message.error('Chỉ tài khoản DRIVER mới có thể đổi ảnh đại diện');
      } else {
        message.error(err.response?.data?.message || 'Tải ảnh thất bại');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setSavingPassword(true);
      await userService.changePassword(values.oldPassword, values.newPassword);
      passwordForm.resetFields();
      message.success('Đổi mật khẩu thành công!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Hồ sơ cá nhân</Title>
        <Text type="secondary">Quản lý thông tin tài khoản của bạn</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card loading={loading} style={{ textAlign: 'center', borderRadius: 12 }}>
            <Upload
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={handleUploadAvatar}
              accept="image/*"
            >
              <div style={{ cursor: 'pointer', display: 'inline-block' }}>
                <Avatar
                  size={120}
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  style={{
                    background: avatarUrl ? undefined : 'linear-gradient(135deg, #1677ff, #69b1ff)',
                    boxShadow: '0 4px 16px rgba(22,119,255,0.25)',
                  }}
                />
                <div style={{ marginTop: 12 }}>
                  <Button icon={<UploadOutlined />} loading={uploadingAvatar} size="small">
                    Đổi ảnh
                  </Button>
                </div>
              </div>
            </Upload>
            <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
              {user?.fullName || 'User'}
            </Title>
            <Text type="secondary">{user?.email}</Text>
            <Divider />
            <div style={{ textAlign: 'left' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Số điện thoại</Text>
              <div style={{ fontWeight: 500 }}>{user?.phoneNumber || '-'}</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Thông tin cá nhân" style={{ borderRadius: 12, marginBottom: 24 }}>
            <Form form={profileForm} layout="vertical" onFinish={handleSaveProfile} disabled={loading}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                  >
                    <Input placeholder="Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                  >
                    <Input placeholder="0912345678" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                  >
                    <Input placeholder="example@email.com" />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={savingProfile}>
                Lưu thay đổi
              </Button>
            </Form>
          </Card>

          <Card title={<span><LockOutlined /> Đổi mật khẩu</span>} style={{ borderRadius: 12 }}>
            <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="oldPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                  >
                    <Input.Password placeholder="••••••••" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                      { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
                    ]}
                  >
                    <Input.Password placeholder="••••••••" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="••••••••" />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" danger htmlType="submit" icon={<LockOutlined />} loading={savingPassword}>
                Đổi mật khẩu
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
