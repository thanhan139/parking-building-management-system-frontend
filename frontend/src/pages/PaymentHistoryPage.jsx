import { useState, useEffect } from 'react';
import { Table, Tag, Typography, App } from 'antd';
import paymentService from '../services/paymentService';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = {
  PENDING: 'orange', COMPLETED: 'green', FAILED: 'red', CANCELLED: 'default', REFUNDED: 'blue',
};

export default function PaymentHistoryPage() {
  const { message } = App.useApp();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPaymentHistory();
      setPayments(res.data.result || res.data || []);
    } catch (err) {
      message.error('Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const columns = [
    { title: 'Mã GD', dataIndex: 'transactionCode', key: 'transactionCode', render: (t) => <Tag>{t}</Tag> },
    { title: 'Loại', dataIndex: 'transactionType', key: 'transactionType', render: (t) => <Tag color={t === 'SUBSCRIPTION' ? 'blue' : 'purple'}>{t}</Tag> },
    { title: 'Biển số', dataIndex: 'plateNumber', key: 'plateNumber' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (t) => t ? `${Number(t).toLocaleString()} VND` : '-' },
    { title: 'Phương thức', dataIndex: 'paymentMethod', key: 'paymentMethod', render: (t) => <Tag>{t}</Tag> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (t) => <Tag color={statusColors[t]}>{t}</Tag> },
    { title: 'VNPay TxnNo', dataIndex: 'vnpTransactionNo', key: 'vnpTransactionNo', render: (t) => t || '-' },
    { title: 'Ngân hàng', dataIndex: 'vnpBankCode', key: 'vnpBankCode', render: (t) => t || '-' },
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (t) => t ? dayjs(t).format('DD/MM/YYYY HH:mm') : '-' },
  ];

  return (
    <div>
      <Title level={4}>Lịch sử thanh toán</Title>
      <Table columns={columns} dataSource={payments} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </div>
  );
}
