const userStatusOptions = [{ label: '正常', value: 1 }, { label: '停用', value: 0 }];
const levelOptions = [
  { value: '', label: '全部' },
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'L3', label: 'L3' },
  { value: 'L4', label: 'L4' },
  { value: 'L5', label: 'L5' },
  { value: 'L6', label: 'L6' },
  { value: 'L7', label: 'L7' },
  { value: 'L8', label: 'L8' },
  { value: 'L9', label: 'L9' },
  { value: 'L10', label: '10' },
];
const wordClasses = [
  { value: 1, label: '名词' },
  { value: 2, label: '动词' },
  { value: 3, label: '形容词' },
  { value: 4, label: '数词' },
  { value: 5, label: '量词' },
  { value: 6, label: '代词' },
  { value: 7, label: '副词' },
  { value: 8, label: '介词' },
  { value: 9, label: '连词' },
  { value: 10, label: '助词' },
  { value: 11, label: '叹词' },
  { value: 12, label: '拟声词' },
];
const searchFormLayout = {
    labelCol: { style: { width: 72 } }
};

export {
  userStatusOptions,
  wordClasses,
  searchFormLayout,
  levelOptions
}