import React from "react";
import { Modal, Divider } from "antd";
import voiceIcon from '@assets/image/icon_voice@2x.png';
import voiceIcon1 from '@assets/image/icon_voice_1@2x.png';
import voiceIcon2 from '@assets/image/icon_voice_2@2x.png';
import rightIcon from '@assets/image/icon_right@2x.png';
import errorIcon from '@assets/image/icon_wrorr@2x.png';
import './index.scss'
import classNames from "classnames";
import { playAudio } from "@utils/index";

interface Iprops {
  questionData: any,
  setModalVisible: (flag: boolean) => void,
}

const PreviewModal: React.FC<Iprops> = (props) => {
  const { questionData, setModalVisible } = props;
  const { exercisesType, templateCode, stem, content } = questionData.data;
  const stems = JSON.parse(stem);
  const contents = JSON.parse(content);

  // console.log(questionData.data, stems, contents, '题目信息');
  let contentNewArr = [];
  if (exercisesType == 5) {
    contents.splitTexts.map((item, index) => {
      if (item.text.indexOf('#') > -1) {
        let arr = [];
        item.text.split('').map((x, i) => {
          arr.push({
            text: x,
            textPinyin: item.textPinyin.split(' ')[i],
            spaceStatus: x == '#' ? 1 : item.spaceStatus
          });
        })
        item.newArr = arr;
      }
    })
    contents.splitTexts.map(v => {
      if (v.newArr) {
        contentNewArr = [...contentNewArr, ...v.newArr];
      } else {
        contentNewArr.push(v);
      }
    })
  }

  return (
    <Modal
      open={questionData.visible}
      title='题目预览'
      onCancel={() => { setModalVisible(false) }}
      footer={null}
    >
      <div className="template-view w-[300px] h-[600px] z-50 mx-auto my-5 px-5 pt-11 pb-4 relative">
        {/* 选择题-看文字选发音 */}
        {exercisesType == 1 && templateCode == 101 &&
          <div>
            <div className="text-base pl-2">选择正确的发音</div>
            <div className="w-[188px] h-[188px] bg-[#00C9E1] rounded-[30px] border-[6px] border-[#91EAF6] mx-auto mt-9 text-white font-PF-ME font-medium flex flex-col justify-center items-center">
              <div className="text-lg">{stems.textPinyin}</div>
              <div className="text-[40px]">{stems.text}</div>
            </div>
            <div className="flex items-center justify-center mt-[100px]">
              {contents.options.map((item, index) => {
                return (
                  <div key={item.optionCode} className={classNames("w-[105px] h-[80px] rounded-xl border-[3px] border-[rgba(0,0,0,0.08)] mr-2.5 flex items-center justify-center cursor-pointer", { 'mr-0': index == contents.options.length - 1 })}>
                    <img src={voiceIcon} className="w-10 h-10" onClick={() => { playAudio(item.audios[0].url) }}></img>
                  </div>
                )
              })}
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 选择题-看图选中文 */}
        {exercisesType == 1 && templateCode == 102 &&
          <div>
            <div className="text-base pl-2">选择正确的含义</div>
            <div className="flex flex-col items-center mt-4">
              <img src={stems.imgUrl} className="w-[70%] max-h-[180px]" />
              <div className="flex flex-col items-center justify-center w-full px-4 mt-4">
                {contents.options.map((item) => {
                  return (
                    <div key={item.optionCode} className="w-full h-[56px] rounded-xl border-2 border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer mb-3 font-PF-ME font-medium text-[#666666]">
                      <span>{item.textPinyin}</span>
                      <span className="text-lg">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 选择题-听音频选中文 */}
        {exercisesType == 1 && templateCode == 103 &&
          <div className="max-h-[450px]  overflow-y-scroll">
            <div className="text-base pl-2">听一听，选一选</div>
            <div className="flex items-center justify-center w-full px-4 mt-5">
              <img src={voiceIcon1} className="w-[100px] h-[100px] mr-5 cursor-pointer" onClick={() => { playAudio(stems.audios[0]?.url) }} />
              <img src={voiceIcon2} className="w-[60px] h-[60px]" />
            </div>
            <div className="flex flex-col flex-wrap items-center justify-center w-full px-4 mt-7">
              {contents.options.map((item) => {
                return (
                  <div key={item.optionCode} className="w-full p-1 rounded-xl border-2 border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer mb-3 font-PF-ME font-medium text-[#666666]">
                    <span>{item.textPinyin}</span>
                    <span className="text-lg">{item.text}</span>
                  </div>
                )
              })}
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 选择题-看文字选文字 */}
        {exercisesType == 1 && templateCode == 104 &&
          <div className="font-PF-RE text-base">
            <div className="pl-2">选一选</div>
            <div className="flex flex-col items-center justify-center w-full px-4 mt-5">
              <div className="whitespace-pre-line line-clamp-4">{stems.text}</div>
              <div className="flex flex-col items-center justify-center w-full mt-7">
                {contents.options.map((item) => {
                  return (
                    <div key={item.optionCode} className="w-full h-[56px] rounded-xl border-2 border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer mb-5 font-PF-ME font-medium text-[#666666]">
                      <span>{item.textPinyin}</span>
                      <span className="text-lg">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 汉语翻译连线 */}
        {exercisesType == 2 &&
          <div className="font-PF-RE text-base">
            <div className="pl-2">连线匹配</div>
            <div className="flex mt-7 px-4">
              <div className="flex flex-col w-1/2 mr-3">
                {contents.options.map((item) => {
                  return (
                    <div key={item.optionCode} className="w-full h-[80px] rounded-xl border-2 border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer font-PF-ME font-medium text-666 mb-5">
                      <span>{item.textPinyin}</span>
                      <span className="text-lg">{item.text}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col w-1/2">
                {contents.optionsContent.map((item) => {
                  return (
                    <div key={item.optionCode + 9} className="w-full h-[80px] rounded-xl border-2 border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer font-PF-ME font-medium text-666 mb-5">
                      <span className="text-lg">{item.textTraslation[0]?.translation}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 连词组句-中译外 */}
        {exercisesType == 3 &&
          <div className="font-PF-RE text-base">
            <div className="pl-2">连词组句</div>
            <div className="mt-6 text-center">
              <div className="text-sm text-999 mb-1">{stems.textPinyin}</div>
              <div className="text-[26px] text-333 mb-4">{stems.text}</div>
              <img src={voiceIcon1} className="w-[100px] h-[100px] mr-5 cursor-pointer" onClick={() => { playAudio(stems.audios[0]?.url) }} />
            </div>
            <Divider></Divider>
            <div className="pl-1 mt-4 flex justify-center items-center flex-wrap">
              {
                contents.splitTranslations[0]?.splitTranslation?.split('?')[0]?.split('#').map((item, index) => {
                  return <div key={index} className="h-[40px] rounded-xl border-2 border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer font-PF-ME font-medium text-666 mb-4 mr-3 px-2">
                    <span className="text-lg">{item}</span>
                  </div>
                })
              }
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 选词填空 */}
        {exercisesType == 4 &&
          <div className="font-PF-RE text-base">
            <div className="pl-2">选词填空</div>
            <div className="px-4 flex flex-col items-center mt-5">
              <img src={stems.imgUrl} className="w-[90%] rounded mx-auto max-h-[200px]" />
            </div>
            <div className="!text-[#666666] flex flex-wrap items-center justify-center px-1 font-PF-ME font-medium mt-4">
              {
                contents.splitTexts.map((item, i) => {
                  return item.spaceStatus ?
                    <span key={i} className="inline-block w-[50px] h-[42px] rounded-lg border-2 border-[#E5E5E5] mx-1"></span>
                    :
                    <div className="flex flex-col">
                      <span className="text-sm">{item.textPinyin}</span>
                      <span className="text-[22px]">{item.text}</span>
                    </div>
                })
              }
            </div>
            <div className="mt-7 flex flex-wrap justify-center">
              {
                contents.options.map((item) => {
                  return <div className="text-666 h-[56px] flex flex-col flex-wrap justify-center items-center px-2 rounded-lg border-2 border-[#E5E5E5] mr-2 mb-1">
                    <div>{item.textPinyin}</div>
                    <div key={item.optionCode} className="inline-block text-[22px]">{item.text}</div>
                  </div>
                })
              }
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 位置填词 */}
        {exercisesType == 5 &&
          <div className="font-PF-RE text-base">
            <div className="pl-2">把词放在正确的位置</div>
            <div className="px-4">
              <div className="mt-8 flex flex-col justify-center items-center text-333">
                <div className="text-[24px]">{contents.splitTexts.find(x => x.spaceStatus)?.textPinyin}</div>
                <div className="text-[48px] mt-3">{contents.splitTexts.find(x => x.spaceStatus)?.text}</div>
              </div>
              <div className="text-[22px] !text-[#666666] flex flex-wrap items-center px-1 font-PF-ME font-medium mt-8 leading-[2.2]">
                {
                  contentNewArr.map((item, i) => {
                    return item.spaceStatus ?
                      <span key={i} className="inline-block w-[50px] h-[42px] rounded-lg border-2 border-[#E5E5E5] mx-1"></span>
                      :
                      <div className="flex flex-col">
                        <span className="text-sm">{item.textPinyin}</span>
                        <span className="text-[22px]">{item.text}</span>
                      </div>
                  })
                }
              </div>
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 判断题-听音判断 */}
        {exercisesType == 6 && templateCode == 601 &&
          <div className="font-PF-RE text-base">
            <div className="pl-2">听一听，做出判断</div>
            <div className="flex items-center justify-center w-full px-4 mt-8">
              <img src={voiceIcon1} className="w-[100px] h-[100px] mr-5 cursor-pointer" onClick={() => { playAudio(stems.audios[0]?.url) }} />
              <img src={voiceIcon2} className="w-[60px] h-[60px]" />
            </div>
            <div className="text-[22px] text-333 mt-10 text-center">{contents.text}</div>
            <div className="flex justify-center mt-20">
              <div className="w-[100px] h-[100px] bg-[#E7F4FF] rounded-xl border-2 border-[#279FFF] flex justify-center items-center cursor-pointer mr-10">
                <img src={rightIcon} className="w-9 h-9" />
              </div>
              <div className="w-[100px] h-[100px] bg-[#E7F4FF] rounded-xl border-2 border-[#279FFF] flex justify-center items-center cursor-pointer">
                <img src={errorIcon} className="w-9 h-9" />
              </div>
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
        {/* 判断题-文字判断 */}
        {exercisesType == 6 && templateCode == 602 &&
          <div className="font-PF-RE text-base">
            <div className="pl-2">判断正误</div>
            <div className="text-[22px] text-333 mt-10 px-4 line-clamp-4">{stems.text}</div>
            <div className="flex justify-center mt-20">
              <div className="w-[100px] h-[100px] bg-[#E7F4FF] rounded-xl border-2 border-[#279FFF] flex justify-center items-center cursor-pointer mr-10">
                <img src={rightIcon} className="w-9 h-9" />
              </div>
              <div className="w-[100px] h-[100px] bg-[#E7F4FF] rounded-xl border-2 border-[#279FFF] flex justify-center items-center cursor-pointer">
                <img src={errorIcon} className="w-9 h-9" />
              </div>
            </div>
            <div className="w-[80%] h-12 flex justify-center items-center bg-[#279FFF] rounded-lg text-white text-lg font-PF-ME font-medium absolute left-8 bottom-8">检查</div>
          </div>
        }
      </div>
    </Modal>
  )
}

export default PreviewModal;
