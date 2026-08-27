import { Button, Popconfirm, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { comboName, ruleState, firstBlockText, nextBlockText, surchargeText, dayText } from './pricingLabels';


export default function PricingHistory({ rules, loading, onRemove, onEdit }) {
  const columns = [
    {
      title: 'Tổ hợp',
      render: (_, rule) => <strong>{comboName(rule)}</strong>,
    },
    {
      title: 'Giá',
      render: (_, rule) => (
        <div style={{ lineHeight: '20px' }}>
          <div>{firstBlockText(rule)}</div>
          <div style={{ color: '#8c8c8c' }}>{nextBlockText(rule)}</div>
        </div>
      ),
    },
    { title: 'Phụ phí tự động', render: (_, rule) => surchargeText(rule) },
    { title: 'Hiệu lực từ', render: (_, rule) => dayText(rule.effectiveFrom) },
    { title: 'Đến', render: (_, rule) => dayText(rule.effectiveTo) },
    {
      title: 'Trạng thái',
      render: (_, rule) => {
        const state = ruleState(rule);
        return <Tag color={state.color}>{state.label}</Tag>;
      },
    },
    {
      title: '',
      width: 88,
      render: (_, rule) => {
        const chuaChay = ruleState(rule).key === 'SCHEDULED';

        if (!chuaChay) {
          return (
            <Tooltip title="Biểu giá đã tới ngày hiệu lực. Đây là bằng chứng số tiền đã thu nên không sửa và không xoá được.">
              <span>
                <Button type="text" icon={<EditOutlined />} disabled />
                <Button type="text" icon={<DeleteOutlined />} disabled />
              </span>
            </Tooltip>
          );
        }

        return (
          <span>
            <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(rule)} />
            <Popconfirm title="Xoá biểu giá này?" okText="Xoá" cancelText="Thôi" onConfirm={() => onRemove(rule.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Table
      size="small"
      rowKey="id"
      loading={loading}
      dataSource={rules}
      columns={columns}
      pagination={false}
      scroll={{ x: 'max-content' }}
    />
  );
}
