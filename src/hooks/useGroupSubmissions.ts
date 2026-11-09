import { sortGroupsByName } from '../components/DiseaseDrawReveal'
import { useEffect, useState } from 'react'
import type { GroupDoc, StageId, SubmissionDoc } from '../types'
import { subscribeGroup, subscribeGroupSubmission, subscribeGroups, subscribeStageSubmissions } from '../lib/session'

// 내 조 하나만 실시간으로 받는다(참가자 화면용). 불러오기 전이나 조가 없으면 undefined.
export function useGroup(code: string | undefined, groupId: string | undefined) {
  const [group, setGroup] = useState<GroupDoc | undefined>(undefined)

  useEffect(() => {
    if (!code || !groupId) return
    setGroup(undefined)
    return subscribeGroup(code, groupId, (g) => setGroup(g ?? undefined))
  }, [code, groupId])

  return group
}

export function useGroups(code: string | undefined) {
  const [groups, setGroups] = useState<GroupDoc[]>([])

  useEffect(() => {
    if (!code) return
    // 화면마다 조가 1조, 2조… 순서로 보이도록 이름의 숫자 기준으로 정렬한다.
    return subscribeGroups(code, (list) => setGroups(sortGroupsByName(list)))
  }, [code])

  return groups
}

export function useStageSubmissions(code: string | undefined, stage: StageId | undefined) {
  const [submissions, setSubmissions] = useState<SubmissionDoc[]>([])

  useEffect(() => {
    if (!code || !stage) return
    return subscribeStageSubmissions(code, stage, setSubmissions)
  }, [code, stage])

  return submissions
}

export function useMyGroupSubmission(code: string | undefined, stage: StageId | undefined, groupId: string | undefined) {
  const [submission, setSubmission] = useState<SubmissionDoc | null>(null)

  useEffect(() => {
    if (!code || !stage || !groupId) return
    setSubmission(null)
    return subscribeGroupSubmission(code, stage, groupId, setSubmission)
  }, [code, stage, groupId])

  return submission
}
