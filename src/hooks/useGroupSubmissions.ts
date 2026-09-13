import { useEffect, useState } from 'react'
import type { GroupDoc, StageId, SubmissionDoc } from '../types'
import { subscribeGroupSubmission, subscribeGroups, subscribeStageSubmissions } from '../lib/session'

export function useGroups(code: string | undefined) {
  const [groups, setGroups] = useState<GroupDoc[]>([])

  useEffect(() => {
    if (!code) return
    return subscribeGroups(code, setGroups)
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
