import { Button, Col, Form, Input, message, Modal, Row, Select, Spin, Upload, UploadProps } from "antd";
import React, { useEffect, useState } from "react";
import { PlusOutlined, UploadOutlined, LoadingOutlined, CloseCircleFilled } from '@ant-design/icons';
import { addWordApi, autoCreateWordApi, queryProgressApi, updateWordApi, uploadFileApi, voiceListApi } from "@service/wordMangement";
import { languageListApi } from "@service/translate";
import classNames from 'classnames';
import { Local } from "@service/storage";
const { Option } = Select;

interface Iprops {
  visible: boolean,
  editInfo: any,
  setModalVisible: (flag: boolean) => void,
}

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

const WordDetailModal: React.FC<Iprops> = ({ visible, editInfo, setModalVisible }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any>([]);
  const [languages, setLanguages] = useState([]); // 翻译语言
  const [autoCreateLoading, setAutoCreateLoading] = useState(false); // 一键生成loading
  const [imgLoading, setImgLoading] = useState(false); // 图片上传loading
  const [audioList, setAudioList] = useState<any>([
    // { name: '男声1', code: 'zhinan', fileList: [], loading: false, url: '' },
    // { name: '男声2', code: 'zhichu', fileList: [], loading: false, url: '' },
    // { name: '女声1', code: 'zhiqi', fileList: [], loading: false, url: '' },
    // { name: '女声2', code: 'zhiru', fileList: [], loading: false, url: '' },
  ])
  const [previewInfo, setPreviewInfo] = useState({ // 图片预览信息
    previewImage: '',
    previewVisible: false,
    previewTitle: ''
  });
  const userName = Local.get('_userInfo')?.account;
  const levelOptions = Local.get('levels');
  useEffect(() => {
    getSettingInfo();
  }, [])

  /** 获取语言和声道 */
  const getSettingInfo = async () => {
    // 语言
    const { data, status } = await languageListApi({
      transStatus: 1
    });
    data.map(item => item.name = item.language);
    if (status !== '00000') { return; }
    setLanguages(data);

    // 声道
    const { data: data1, status: status1 } = await voiceListApi({
      transStatus: 1
    });
    data1.map(item => {
      item.fileList = [],
      item.loading = false,
      item.url = ''
    })
    if (status1 !== '00000') { return; }
    setAudioList(data1);

    if (editInfo.id) { // 回显编辑信息
      setEditInfo(data, data1);
    }
  }

  /** 回填编辑信息 */
  const setEditInfo = (languageData, voiceData) => {
    form.setFieldsValue({
      wordType: String(editInfo.wordType),
      wordLevel: editInfo.wordLevel.split(','),
      word: editInfo.word,
      pinyin: editInfo.pinyin,
      partsOfSpeech: editInfo.partsOfSpeech ? editInfo.partsOfSpeech : '',
      remark: editInfo.remark,
    })
    if (editInfo.picture) {
      const pic = editInfo.picture?.split('/') || [];
      setFileList([{ url: editInfo.picture, uid: 1, name: pic[pic.length - 1] }]);
    }
    const wordTranslation = editInfo.wordTranslation ? JSON.parse(editInfo.wordTranslation) : [];
    const languagesList = languageData;
    languagesList.map(item => {
      wordTranslation.map(x => {
        if (item.code == x.code) {
          item.translation = x.translation
        }
      })
    });
    setLanguages(() => languagesList);
    const audioArr = editInfo.wordTranslation ? JSON.parse(editInfo.audio) : [];
    const audioTemp = voiceData;
    audioTemp.map(item => {
      audioArr.map(x => {
        if (item.code == x.code) {
          item.url = x.url
        }
      })
    });
    setAudioList(() => audioTemp);
  }

  /** 确定 */
  const handleOk = () => {
    form.validateFields().then(async () => {
      if (!languages.find(item => item.code == 'en-US')?.translation) {
        message.warning('请输入英文翻译！');
        return;
      }
      if (!audioList.find(item => item.code == 'zhinan')?.url) {
        message.warning('请上传男声1音频！');
        return;
      }
      let formValues = form.getFieldsValue(true);
      let params = {
        ...formValues,
        syntaxType: 'word',
        wordLevel: formValues.wordLevel.join(','),
        audio: JSON.stringify(audioList.map((x) => {
          return {
            name: x.name,
            code: x.code,
            url: x.url
          }
        })),
        wordTranslation: JSON.stringify(languages.map((x) => {
          return {
            name: x.name,
            code: x.code,
            translation: x.translation
          }
        }))
      }
      if (editInfo.id) {
        params.id = editInfo.id;
        params.modifier = userName;
      } else {
        params.creator = userName;
      }
      const { data, status } = editInfo.id ? await updateWordApi(params) : await addWordApi(params);
      if (status !== '00000') { return; }
      setModalVisible(true);
      message.success(`${editInfo.id ? '编辑' : '新建'}成功`);
      form.resetFields();
    });
  };

  /** 取消 */
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const uploadButton = (
    <div>
      {imgLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传照片</div>
    </div>
  );

  /** 自定义上传音频/图片 */
  const customUpload = async (event, type, code?) => {
    const formData = new FormData();
    formData.append('file', event.file)
    const { data, status } = await uploadFileApi(formData);
    if (status !== '00000') { return; }
    if (type == 'img') {
      form.setFieldsValue({ picture: data.url });
      let fileObj = [{
        url: data.url,
        name: data.fileName
      }];
      setFileList(fileObj);
      setImgLoading(false);
    } else if (type == 'audio') {
      let audioArr = JSON.parse(JSON.stringify(audioList));
      audioArr.map(item => {
        if (item.code == code) {
          item.url = data.url;
          item.loading = false;
        }
      });
      setAudioList(() => audioArr);
    }
  }

  /** 图片上传 */
  const onImageChange = (file) => {
    const { response, status } = file;
    if (status === 'uploading') {
      setImgLoading(true);
    }
    if (status === 'done' || status === 'removed' || status === 'error') {
      setImgLoading(false);
    }
  }

  /** 图片预览 */
  const onPreview = () => {
    setPreviewInfo({
      previewImage: fileList[0].url,
      previewVisible: true,
      previewTitle: fileList[0].name
    })
  }

  /** 图片删除 */
  const onRemove = () => {
    setFileList([]);
    form.setFieldsValue({ picture: undefined });
  }

  /** 音频上传 */
  const onAudioChange = (file, code) => {
    const { response, status } = file;
    let audioArr = JSON.parse(JSON.stringify(audioList));
    if (status === 'uploading') {
      audioArr.map(item => {
        if (item.code == code) {
          item.loading = true
        }
      });
    }
    if (status === 'done' || status === 'removed' || status === 'error') {
      audioArr.map(item => {
        if (item.code == code) {
          item.loading = false
        }
      });
    }
    setAudioList(() => audioArr)
  }

  /** 播放音频 */
  const playAudio = (url) => {
    let audio = document.createElement('audio'); //生成一个audio元素 
    audio.controls = true; //这样控件才能显示出来 
    audio.src = url;
    audio.play();
    audio.remove();
  }

  /** 删除音频 */
  const deleteAudio = (code) => {
    let audioArr = JSON.parse(JSON.stringify(audioList));
    audioArr.map(item => {
      if (item.code == code) {
        item.url = '';
      }
    });
    setAudioList(() => audioArr);
  }

  /** 翻译输入事件 */
  const inputTranslate = (e, code) => {
    let arr = JSON.parse(JSON.stringify(languages));
    arr.map(item => {
      if (item.code == code) {
        item.translation = e.target.value;
      }
    })
    setLanguages(() => arr);
  }

  /** 一键生成 */
  const autoCreate = async () => {
    if (autoCreateLoading == true) return;
    const word = form.getFieldValue('word');
    if (!word) {
      message.warning('请先输入字词');
      return;
    } else {
      setAutoCreateLoading(true);
      let wordTranslation = languages.map(v => {
        return {
          name: v.name,
          code: v.code,
          translation: v.translation ? v.translation : ''
        }
      });
      let audio = audioList.map(v => {
        return {
          name: v.name,
          code: v.code,
          url: v.url ? v.url : ''
        }
      });
      const { data, status } = await autoCreateWordApi({
        word: form.getFieldValue('word'),
        wordTranslation: JSON.stringify(wordTranslation),
        audio: JSON.stringify(audio)
      });
      if (status !== '00000') { return; }
      const timer = setInterval(async () => {
        const { data: data1, status: status1 } = await queryProgressApi({
          id: data
        });
        if (data1?.progress == 100) {
          clearInterval(timer);
          if (!form.getFieldValue('pinyin')) {
            form.setFieldValue('pinyin', data1.data.pinyin);
          }
          const translation = data1.data.wordTranslation ? JSON.parse(data1.data.wordTranslation) : [];
          const languagesList = languages;
          languagesList.map(item => {
            translation.map(x => {
              if (item.code == x.code) {
                item.translation = x.translation
              }
            })
          });
          const audioArr = data1.data.audio ? JSON.parse(data1.data.audio) : [];
          const audioTemp = audioList;
          audioTemp.map(item => {
            audioArr.map(x => {
              if (item.code == x.code) {
                item.url = x.url
              }
            })
          });
          setLanguages(() => languagesList);
          setAudioList(() => audioTemp);
          setAutoCreateLoading(false);
        } else if (data1?.progress == -100) {
          clearInterval(timer);
          message.error(data1.data ? data1.data : '一键生成异常');
          setAutoCreateLoading(false);
        } else if (!data1) {
          clearInterval(timer);
          setAutoCreateLoading(false);
          message.error('一键生成失败，请重新生成');
        }
      }, 3000)
    }
  }

  return (
    <Modal
      open={visible}
      title={`${editInfo.id? '编辑' : '新建'}字词`}
      onOk={handleOk}
      onCancel={handleCancel}
      width={560}
      footer={
        <div>
          <div className="inline-block float-left ml-11 mt-[5px] text-sm"><span className="text-[#1677FF] cursor-pointer" onClick={autoCreate}>一键生成</span><span className="text-[rgba(0,0,0,.25)]">（拼音、音频、翻译为空自动生成）</span>{autoCreateLoading && <Spin className="ml-1"></Spin>}</div>
          <Button key="back" onClick={handleCancel}>
            取消
          </Button>
          <Button type="primary" onClick={handleOk}>
            确定
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        labelCol={{ style: { width: 72 } }}
        // onFinish={onFinish}
        autoComplete='off'
        className="pt-5"
      >
        <Row gutter={24}>
          <Col span={11}>
            <Form.Item
              name="wordType"
              label="类型"
              rules={[
                { required: true, whitespace: true, message: '请选择类型!' }
              ]}
            >
              <Select placeholder="请选择" className="!w-[180px]">
                <Option value="1">成人中文</Option>
                <Option value="2">少儿中文</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="wordLevel"
              label="等级"
              rules={[
                { required: true, message: '请选择等级!' }
              ]}
            >
              <Select placeholder="请选择" mode="multiple" allowClear className="!w-[180px]">
                {levelOptions.map(item => {
                  return <Option key={item.value} value={item.value}>{item.label}</Option>
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="word"
          label="字词"
          rules={[
            { required: true, whitespace: true, message: '请输入字词!' }
          ]}
        >
          <Input placeholder="请输入" className="!w-[312px]" maxLength={5} />
        </Form.Item>
        <Form.Item
          name="pinyin"
          label="拼音"
          rules={[
            { required: true, whitespace: true, message: '请输入拼音!' }
          ]}
        >
          <Input placeholder="请输入" className="!w-[312px]" />
        </Form.Item>
        <Form.Item
          // name="wordTranslation"
          label="翻译"
          className="mt-[-5px]"
        >
          <div className="flex flex-wrap items-center mt-[5px]">
            {languages.map((item, index) => {
              return (
                <div key={item.id} className={classNames("mb-2", {'mr-6': index%2 == 0 } )}>
                  <div>{item.code == 'en-US' && <span className="required"></span>}{item.name}</div>
                  <Input placeholder="请输入" className="!w-[200px]" value={item.translation} onInput={(e) => { inputTranslate(e, item.code) }} />
                </div>
              )
            })}
          </div>
        </Form.Item>
        <Form.Item
          name="partsOfSpeech"
          label="词类"
          className="-mt-2"
        >
          <Select placeholder="请选择" className="!w-[144px]">
            {wordClasses.map(item => {
              return <Option key={item.value} value={item.value}>{item.label}</Option>
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label="图片"
          name="picture"
        >
          <div>
            <Upload
              name="picture"
              accept="image/*"
              fileList={fileList}
              maxCount={1}
              onChange={({ file }) => onImageChange(file)}
              customRequest={(event) => { customUpload(event, 'img') }}
              onPreview={onPreview}
              onRemove={onRemove}
              listType="picture-card">
              {fileList.length < 1 ? uploadButton : null}
            </Upload>
            <Modal
              open={previewInfo.previewVisible}
              title={previewInfo.previewTitle}
              footer={null}
              onCancel={() => setPreviewInfo({ ...previewInfo, previewVisible: false })}
            >
              <img style={{ width: '100%' }} src={previewInfo.previewImage} alt='img' />
            </Modal>
          </div>
        </Form.Item>
        <Form.Item
          name="audio"
          label="音频"
          className="mt-[-5px]"
        >
          <div className="flex flex-wrap items-center w-[80%] mt-[5px] space-y-[5px]">
            {audioList.map((item, i) => {
              return (
                <div className="mr-6 relative" key={item.code}>
                  <div className="mb-1">{item.code == 'zhinan' && <span className="required"></span>}{item.name}</div>
                  {
                    item.url ?
                      <div><Button type="primary" className="w-[110px]" onClick={() => { playAudio(item.url) }}>播放</Button><CloseCircleFilled className="text-[red] text-xs absolute right-[-16px]" onClick={() => { deleteAudio(item.code) }} /></div>
                      :
                      <Upload
                        className="w-[106px]"
                        name='audio'
                        accept=".mp3"
                        fileList={item.fileList}
                        customRequest={(event) => { customUpload(event, 'audio', item.code) }}
                        onChange={({ file }) => onAudioChange(file, item.code)}
                      >
                        {
                          item.loading ?
                            <span className="w-[110px] h-[30px] flex justify-center items-center rounded-[6px] border border-solid border-[#d9d9d9]"><LoadingOutlined /></span>
                            :
                            <Button icon={<UploadOutlined />}>上传文件</Button>
                        }
                      </Upload>
                  }
                </div>
              )
            })}
          </div>
        </Form.Item>
        <Form.Item
          name="remark"
          label="备注"
        >
          <Input placeholder="请输入" className="!w-[312px]" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
export default WordDetailModal;