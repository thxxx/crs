import styled from '@emotion/styled'
import React, { use, useEffect, useRef, useState } from 'react'
import Dot from '../dot'
import { Input } from '@chakra-ui/react'
import Airplane from '../../../../public/asset/common/airplane.svg'
import Image from 'next/image'
import SeekerTalk, { SeekerTalkContainer, Talk } from '../talk/seeker-talk'
import RecommenderTalk from '../talk/recommender-talk'
import axios from 'axios'

type ContentType = {
  type: 'seeker' | 'recommender'
  desc: string
}

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
      setContent(response.data[0])
      setMovies(response.data[1])
      setLoading(false)
      console.log('-----', response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const onClickAirplane = (e: any) => {
    e.preventDefault()
    if (inputValue !== '') {
      const temp: ContentType[] = [
        ...content,
        { type: 'seeker', desc: inputValue },
      ]
      setContent(temp)
      setInputValue('')
      sendData(temp)
    }
  }

  const onClickFeedback = async (index: number, type: 'like' | 'dislike') => {
    console.log(index, type)
    const response = await axios.post('http://localhost:5001/api', {
      index,
      type,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div>
        {movies.map((item) => {
          return (
            <MovieList>
              {item.title}, {item.score}점
            </MovieList>
          )
        })}
      </div>
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
                <Choices
                  onClick={(e) => {
                    setInputValue('Can you recommend me a movie?')
                    onClickAirplane(e)
                  }}
                >
                  Can you recommend me a movie?
                </Choices>
                <Choices
                  onClick={(e) => {
                    setInputValue('Give me a movie for tonight.')
                    onClickAirplane(e)
                  }}
                >
                  Give me a movie for tonight
                </Choices>
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
  )
}

export default Dialog

const DialogContainer = styled.div`
  width: 70%;
  height: 80vh;
  margin: 5vh auto;
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
  max-width: 300px;
`

const Choices = styled.div`
  font-size: 14px;
  padding: 3px 6px;
  margin: 3px 0px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
`
