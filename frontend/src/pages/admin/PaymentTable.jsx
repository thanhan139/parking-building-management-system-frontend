import { Table, Tag } from 'antd';
import { money } from '../staff/format';
import { CATEGORY, CUSTOMER, shortTime } from './pricingLabels';

const STATUS = {
  PAID: { color: 'green', label: 'Đã thu' },
  PENDING: { color: 'orange', label: 'Chờ trả' },
  CANCELLED: { color: 'default', label: 'Đã huỷ' },
};

const METHOD = { CASH: 'Tiền mặt', VNPAY: 'Quét mã QR' };

export default function PaymentTable({ payments, loading }) {
  const columns = [
    { title: 'Vé', dataIndex: 'ticketCode' },
    { title: 'Biển số', render: (_, row) => row.plateNumber || '—' },
    { title: 'Loại xe', render: (_, row) => CATEGORY[row.vehicleCategory] || row.vehicleCategory },
    { title: 'Khách', render: (_, row) => CUSTOMER[row.customerType] || '—' },
    { title: 'Vào', render: (_, row) => shortTime(row.entryTime) },
    { title: 'Ra', render: (_, row) => shortTime(row.exitTime) },
    { title: 'Tiền gửi', align: 'right', render: (_, row) => money(row.amountParking) },
    { title: 'Phụ phí', align: 'right', render: (_, row) => money(row.amountSurcharge) },
    {
      title: 'Tổng',
      align: 'right',
      render: (_, row) => <strong>{money(row.amountTotal)}</strong>,
    },
    {
      title: 'Trạng thái',
      render: (_, row) => {
        const state = STATUS[row.status] || { color: 'default', label: row.status };
        return <Tag color={state.color}>{state.label}</Tag>;
      },
    },
    { title: 'Hình thức', render: (_, row) => METHOD[row.method] || row.method },
    { title: 'Nhân viên', render: (_, row) => row.staffName || '—' },
  ];

  return (
    <Table
      size="small"
      rowKey="id"
      loading={loading}
      dataSource={payments}
      columns={columns}
      pagination={{ pageSize: 20, showSizeChanger: false }}
      scroll={{ x: 'max-content' }}
    />
  );
}
