import styled from '@emotion/styled'
import Image from 'next/image'
import React from 'react'

type Props = {
  index: number
  desc: string
  feedback: '' | 'like' | 'dislike'
  onClickFeedback: (index: number, type: 'like' | 'dislike') => void
}

const RecommenderTalk = ({ index, desc, feedback, onClickFeedback }: Props) => {
  return (
    <RecommenderTalkContainer>
      <Talk>
        <Text>{desc}</Text>
      </Talk>
      <div style={{ display: 'flex' }}>
        <Icon
          onClick={() => onClickFeedback(index, 'like')}
          style={{ background: feedback === 'like' ? `blue` : 'gray' }}
        >
          <Image src='/like.png' width={17} height={17} alt='like' />
        </Icon>
        <Icon
          onClick={() => onClickFeedback(index, 'dislike')}
          style={{ background: feedback === 'dislike' ? `red` : 'gray' }}
        >
          <Image src='/dislike.png' width={17} height={17} alt='dislike' />
        </Icon>
      </div>
    </RecommenderTalkContainer>
  )
}

export default RecommenderTalk

const Icon = styled.span`
  padding: 8px;
  border-radius: 36px;
  cursor: pointer;
  background: rgba(200, 200, 250, 0.3);
  margin: 0px 2px;

  &:hover {
    background: rgba(200, 200, 250, 0.5);
  }
`

const RecommenderTalkContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`

const Talk = styled.div`
  display: inline-block;
  max-width: 400px;
  padding: 8px 10px;
  margin-bottom: 10px;
  margin-right: 0px;
  border-radius: 4px;
  background-color: #dae3f3;
  word-break: keep-all;
`

const Text = styled.p`
  font-size: 14px;
  font-weight: 400;
  font-family: Pretendard;
  color: #003876;
`
