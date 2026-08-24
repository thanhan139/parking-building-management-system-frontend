import { Card, Empty, Tag } from 'antd';
import {
  CUSTOMER, TYPE_LABELS, ruleState,
  firstBlockText, nextBlockText, surchargeText, dayText,
} from './pricingLabels';

function Line({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: '22px' }}>
      <span style={{ color: '#8c8c8c', width: 78, flexShrink: 0 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function PricingActive({ rules }) {
  const running = rules.filter((rule) => ruleState(rule).key === 'RUNNING');

  if (!running.length) {
    return (
      <Empty description="Chưa có biểu giá nào đang chạy" />
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {running.map((rule) => (
          <Card
            key={rule.id}
            size="small"
            title={`${TYPE_LABELS[rule.vehicleTypeCode] || rule.vehicleTypeCode || 'Không rõ loại'} · ${CUSTOMER[rule.customerType] || '—'}`}
            extra={<Tag color="green">Đang chạy</Tag>}
            styles={{ body: { padding: 12 } }}
          >
            <Line label="Khối đầu" value={firstBlockText(rule)} />
            <Line label="Khối tiếp" value={nextBlockText(rule)} />
            <Line label="Phụ phí" value={surchargeText(rule)} />
            <Line label="Áp dụng từ" value={dayText(rule.effectiveFrom)} />
          </Card>
        ))}
      </div>
    </div>
  );
}
