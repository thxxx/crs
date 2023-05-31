import styled from '@emotion/styled'
import React, { use, useEffect, useRef, useState } from 'react'
import Dot from '../dot'
import { Button, Input } from '@chakra-ui/react'
import Airplane from '../../../../public/asset/common/airplane.svg'
import Image from 'next/image'
import SeekerTalk, { SeekerTalkContainer, Talk } from '../talk/seeker-talk'
import RecommenderTalk from '../talk/recommender-talk'
import axios from 'axios'

type ContentType = {
  type: 'seeker' | 'recommender'
  desc: string
  feedback: '' | 'like' | 'dislike'
}

const RESET_COMMAND = 'reset'
const FIRST_SENTENCES = [
  'Can you recommend me a movie?',
  'Give me a movie for tonight',
]

const Dialog = () => {
  const [content, setContent] = useState<ContentType[]>([])
  const [movies, setMovies] = useState([
    {
      title: '',
      score: 0,
    },
  ])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (element) {
      element.scrollTop = element.scrollHeight
    }
  }, [content])

  const onChangeInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value)
  }
  const sendData = async (temp?: any) => {
    try {
      setLoading(true)
      const response = await axios.post(
        'http://localhost:5001/api',
        temp ?? content
      )
      console.log(response.data[0])
      setContent(response.data[0])
      setMovies(response.data[1])
      setLoading(false)
      console.log('-----', response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const onClickAirplane = async (e: any) => {
    e.preventDefault()
    if (inputValue !== '') {
      const temp: ContentType[] = [
        ...content,
        { type: 'seeker', desc: inputValue, feedback: '' },
      ]
      setContent(temp)
      setInputValue('')
      await sendData(temp)
    }
    if (inputValue === RESET_COMMAND) {
      setContent([])
      setMovies([])
      setInputValue('')
    }
  }

  const onClickFeedback = async (index: number, type: 'like' | 'dislike') => {
    console.log(index, type, content[index])
    let contentCopy = content
    if (content[index].feedback === type) {
      contentCopy[index].feedback = ''
    } else {
      contentCopy[index].feedback = type
    }
    setContent([...contentCopy])
    const response = await axios.post('http://localhost:5001/api', {
      index,
      type,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div
        style={{
          width: '70%',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px',
        }}
      >
        <Button
          w={300}
          onClick={async () => {
            await sendData([
              { type: 'seeker', desc: RESET_COMMAND, feedback: '' },
            ])
            setContent([])
            setMovies([])
            setInputValue('')
          }}
        >
          Reset the Conversation
        </Button>
        <DialogContainer>
          <TopBar>
            <DotBox>
              <Dot c='#FF5E58' />
              <Dot c='#FEBD2B' />
              <Dot c='#00C403' />
            </DotBox>
          </TopBar>
          {loading && <>loading...</>}
          <TalkBox ref={elementRef}>
            {content.length === 0 && (
              <SeekerTalkContainer>
                <Talk style={{ padding: '6px 12px' }}>
                  {FIRST_SENTENCES.map((item) => {
                    return (
                      <Choices
                        onClick={async (e) => {
                          await sendData([
                            {
                              type: 'seeker',
                              desc: item,
                              feedback: '',
                            },
                          ])
                        }}
                      >
                        {item}
                      </Choices>
                    )
                  })}
                </Talk>
              </SeekerTalkContainer>
            )}
            {content.map((item, index) => {
              return item.type === 'seeker' ? (
                <SeekerTalk key={index} desc={item.desc} />
              ) : (
                item.type === 'recommender' && (
                  <RecommenderTalk
                    key={index}
                    index={index}
                    desc={item.desc.split(':')[1]}
                    feedback={item.feedback}
                    onClickFeedback={onClickFeedback}
                  />
                )
              )
            })}
          </TalkBox>
          <InputBox onSubmit={(e) => onClickAirplane(e)}>
            <Input
              fontSize='sm'
              value={inputValue}
              onChange={onChangeInputValue}
              focusBorderColor='#f4f4f4'
            />
            <Image
              src='/asset/common/airplane.svg'
              alt=''
              width={30}
              height={30}
              style={{ marginLeft: '20px' }}
              onClick={(e) => onClickAirplane(e)}
            />
          </InputBox>
        </DialogContainer>
      </div>
      <div style={{ width: '25%' }}>
        <MovieContainer>
          <p>현재 추천할 영화 점수</p>
          {movies.map((item) => {
            return (
              <MovieList>
                <span>{item.title}</span>
                <span>{item.score}점</span>
              </MovieList>
            )
          })}
        </MovieContainer>
      </div>
    </div>
  )
}

export default Dialog

const MovieContainer = styled.div`
  margin-top: 75px;
  border-radius: 6px;
  background: rgba(0, 0, 50, 0.03);
  padding: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;

  p {
    margin: 5px 0px;
  }
`

const DialogContainer = styled.div`
  width: 100%;
  height: 80vh;
  margin: 2vh auto;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
`

const TopBar = styled.div`
  width: 100%;
  height: 4vh;
  border-radius: 9px 9px 0px 0px;
  background-color: #e8e8e8;
  display: flex;
  align-items: center;
`

const DotBox = styled.div`
  margin-left: 20px;
  display: flex;
  flex-direction: row;
`

const TalkBox = styled.div`
  width: 100%;
  height: calc(100% - 5vh - 40px - 20px - 20px);
  padding: 20px 20px 0px 20px;
  margin-bottom: 20px;
  overflow-y: scroll;
`

const InputBox = styled.form`
  width: 100%;
  height: 40px;
  padding: 0px 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const MovieList = styled.div`
  padding: 10px;
  border: 0.5px solid rgba(0, 0, 50, 0.2);
  margin: 3px 0px;
  display: flex;
  justify-content: space-between;
  border-radius: 3px;
  width: 100%;
`

const Choices = styled.div`
  font-size: 14px;
  padding: 5px 8px;
  margin: 3px 0px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
`
