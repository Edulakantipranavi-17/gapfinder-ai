import { Course, UserProfile } from '../types';

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'user-judge',
    name: 'Evaluator / Judge Mode',
    email: 'judge@gapfinder.ai',
    role: 'judge',
    avatar: '⚖️',
    activeCourseId: 'course-cs301',
    streakDays: 4,
  },
  {
    id: 'user-alex',
    name: 'Alex Rivera (CS Major)',
    email: 'alex.rivera@cs.edu',
    role: 'student',
    avatar: '👨‍💻',
    activeCourseId: 'course-cs301',
    streakDays: 7,
  },
  {
    id: 'user-maya',
    name: 'Maya Patel (Pre-Med / Bio)',
    email: 'maya.patel@bio.edu',
    role: 'student',
    avatar: '🧬',
    activeCourseId: 'course-bio102',
    streakDays: 12,
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-cs301',
    title: 'Operating Systems & Systems Architecture',
    code: 'CS 301',
    department: 'Computer Science',
    examDate: '2026-11-05',
    daysRemaining: 10,
    studyHoursPerDay: 2.5,
    documents: [
      {
        id: 'doc-cs301-syl',
        title: 'CS 301 Course Syllabus & Exam Blueprint.md',
        type: 'syllabus',
        uploadedAt: '2026-10-20T10:00:00Z',
        wordCount: 840,
        content: `# CS 301: Operating Systems & Architecture — Fall Syllabus
Course Weightage & Topics:
- Unit 1: CPU Scheduling & Context Switching (Weightage: 20%)
  Preemptive vs Non-preemptive scheduling, Round Robin quantum tuning, Multilevel Feedback Queues (MLFQ), context switch latency and cache invalidation penalties.
- Unit 2: Concurrency, Synchronization & Deadlocks (Weightage: 30%)
  Race conditions, Critical Section 3 requirements (Mutual Exclusion, Progress, Bounded Waiting). Semaphores vs Mutexes, Monitors. Coffman 4 conditions for Deadlock. Banker's Algorithm safety state vs deadlock state.
- Unit 3: Virtual Memory & Paging Architectures (Weightage: 30%)
  Paging vs Segmentation, Multi-level page tables, TLB hit/miss calculation and Effective Access Time (EAT), Page replacement algorithms (FIFO, Belady's anomaly, LRU, Clock/Second-chance). Thrashing and Working Set Model.
- Unit 4: File Systems, Inodes & Crash Consistency (Weightage: 20%)
  Inode structures, direct vs indirect pointers, Fast File System (FFS) allocation groups, journaling (write-ahead log, metadata journaling vs data journaling), fsck repairs.`,
        chunks: [
          {
            id: 'chunk-syl-1',
            docId: 'doc-cs301-syl',
            docTitle: 'CS 301 Course Syllabus & Exam Blueprint.md',
            section: 'Unit 2: Concurrency & Deadlocks Scope',
            text: 'Unit 2 Concurrency comprises 30% of midterm & final exam weightage. Students must demonstrate formal verification of Banker Algorithm safe sequences and identify race conditions in multithreaded snippets.',
            keywords: ['Concurrency', 'Deadlocks', 'Banker Algorithm', 'Syllabus Weightage'],
          },
          {
            id: 'chunk-syl-2',
            docId: 'doc-cs301-syl',
            docTitle: 'CS 301 Course Syllabus & Exam Blueprint.md',
            section: 'Unit 3: Virtual Memory Architecture',
            text: 'Virtual Memory (30% weightage): Covers Effective Access Time (EAT), TLB lookups, Page Replacement algorithms (LRU, Clock), Beladys Anomaly, and Thrashing prevention using the Working Set Model.',
            keywords: ['Virtual Memory', 'EAT', 'TLB', 'Belady', 'Thrashing'],
          },
        ],
      },
      {
        id: 'doc-cs301-notes-vm',
        title: 'Lecture 14-16: Virtual Memory, TLB & Replacement Notes.md',
        type: 'notes',
        uploadedAt: '2026-10-21T14:30:00Z',
        wordCount: 1420,
        content: `# Lecture 14-16 Notes: Virtual Memory & Paging Mechanics

### 1. Translation Lookaside Buffer (TLB) & Effective Access Time (EAT)
- A TLB is a high-speed associative hardware cache holding recent virtual-to-physical address mappings.
- Effective Access Time formula:
  EAT = (Hit Ratio * (TLB Search Time + Memory Access Time)) + ((1 - Hit Ratio) * (TLB Search Time + (N + 1) * Memory Access Time))
  where N is the number of levels in a multi-level page table!
- CRITICAL STUDENT TRAP: On a TLB miss in a 2-level page table, memory must be accessed twice for the page tables PLUS once for the actual target data frame. Many students mistakenly multiply by 2 instead of (2 + 1) = 3 total memory accesses!

### 2. Page Replacement & Anomalies
- FIFO suffers from Belady's Anomaly: allocating MORE page frames can paradoxically INCREASE the total number of page faults for specific reference strings.
- LRU (Least Recently Used) is an optimal approximation stack algorithm and does NOT suffer from Belady's Anomaly because the set of pages in memory for N frames is always a strict subset of pages for N+1 frames.
- Clock (Second-Chance) Algorithm uses a reference bit per frame. If bit == 0, replace frame; if bit == 1, clear bit to 0 and advance pointer.

### 3. Thrashing & Working Set Model
- Thrashing occurs when the sum of locality working sets across active processes exceeds total available physical RAM frames (sum(WSS_i) > Total Frames).
- Consequence: CPU utilization plummets toward near zero while page fault rate spikes to near 100%, because processes spend all CPU cycles waiting on disk I/O paging queue.`,
        chunks: [
          {
            id: 'chunk-vm-1',
            docId: 'doc-cs301-notes-vm',
            docTitle: 'Lecture 14-16: Virtual Memory, TLB & Replacement Notes.md',
            section: '1. TLB Effective Access Time Calculation',
            text: 'Effective Access Time formula: EAT = (Hit * (TLB + Mem)) + ((1 - Hit) * (TLB + (N + 1) * Mem)). In a 2-level page table, a TLB miss incurs 2 page table memory references plus 1 data memory reference (3 total memory accesses).',
            keywords: ['TLB', 'EAT', 'Multi-level page table', 'Memory access'],
          },
          {
            id: 'chunk-vm-2',
            docId: 'doc-cs301-notes-vm',
            docTitle: 'Lecture 14-16: Virtual Memory, TLB & Replacement Notes.md',
            section: '2. Beladys Anomaly & LRU Stack Property',
            text: 'Beladys Anomaly occurs in FIFO replacement where increasing frames increases faults. Stack algorithms like LRU never suffer from Beladys Anomaly because pages in memory of size n is a subset of size n+1.',
            keywords: ['Belady Anomaly', 'FIFO', 'LRU', 'Stack algorithm'],
          },
          {
            id: 'chunk-vm-3',
            docId: 'doc-cs301-notes-vm',
            docTitle: 'Lecture 14-16: Virtual Memory, TLB & Replacement Notes.md',
            section: '3. Thrashing Diagnostics',
            text: 'Thrashing occurs when sum of Working Set Sizes exceeds physical RAM. CPU utilization drops because all threads block awaiting I/O. The OS must suspend/swap out processes to restore healthy execution.',
            keywords: ['Thrashing', 'Working Set Size', 'CPU Utilization', 'Swapping'],
          },
        ],
      },
      {
        id: 'doc-cs301-notes-sync',
        title: 'Lecture 9-11: Synchronization, Mutex & Deadlocks.md',
        type: 'notes',
        uploadedAt: '2026-10-22T09:15:00Z',
        wordCount: 1650,
        content: `# Lecture 9-11: Synchronization & Deadlocks

### 1. Critical Section Requirements
A valid synchronization solution must satisfy THREE mandatory criteria:
1. Mutual Exclusion: If process P is executing in its critical section, no other processes can execute in their critical sections.
2. Progress: If no process is executing in its critical section and some processes wish to enter, only those processes not executing in their remainder sections can participate in deciding who enters next. Selection cannot be postponed indefinitely.
3. Bounded Waiting: A bound must exist on the number of times that other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted (prevents starvation).

### 2. Deadlock Invariants (Coffman Conditions)
Deadlock can arise IF AND ONLY IF all four conditions hold simultaneously:
1. Mutual Exclusion (non-shareable resources)
2. Hold and Wait (process holding >=1 resource while requesting others)
3. No Preemption (resources cannot be forcibly confiscated)
4. Circular Wait (a closed cycle of processes P0 -> P1 -> ... -> P0 where each waits on a resource held by the next)

### 3. Banker's Algorithm & Safe States
- A state is SAFE if there exists an execution sequence <P1, P2, ..., Pn> such that for each Pi, the resources that Pi can still request can be satisfied by currently available resources plus resources held by all preceding Pj (j < i).
- KEY DISTINCTION: An unsafe state is NOT necessarily deadlocked! An unsafe state merely creates the risk that deadlock could occur if processes request their maximum claims. Deadlock is a strict subset of unsafe states.`,
        chunks: [
          {
            id: 'chunk-sync-1',
            docId: 'doc-cs301-notes-sync',
            docTitle: 'Lecture 9-11: Synchronization, Mutex & Deadlocks.md',
            section: '1. Critical Section 3 Requirements',
            text: 'The 3 mandatory criteria for critical section correctness are Mutual Exclusion, Progress, and Bounded Waiting. Solutions lacking bounded waiting risk indefinite starvation even if mutual exclusion holds.',
            keywords: ['Critical Section', 'Mutual Exclusion', 'Progress', 'Bounded Waiting'],
          },
          {
            id: 'chunk-sync-2',
            docId: 'doc-cs301-notes-sync',
            docTitle: 'Lecture 9-11: Synchronization, Mutex & Deadlocks.md',
            section: '3. Banker Algorithm Safe State vs Deadlock',
            text: 'An unsafe state is not automatically a deadlock state. An unsafe state implies the operating system cannot guarantee avoidance of deadlock if all processes simultaneously demand their peak claim.',
            keywords: ['Banker Algorithm', 'Safe State', 'Unsafe State', 'Deadlock subset'],
          },
        ],
      },
      {
        id: 'doc-cs301-past-exam',
        title: 'Past Exam Paper: Midterm 2023 with Solutions.md',
        type: 'past_paper',
        uploadedAt: '2026-10-23T11:00:00Z',
        wordCount: 1100,
        content: `# Midterm Exam 2023: Solved Problems

### Problem 3: Multi-Level Paging EAT (Weight: 10 marks)
A 32-bit system uses 2-level paging. Memory access time is 100 ns, TLB lookup time is 20 ns.
Given a TLB hit ratio of 90%:
Solution:
TLB Hit Time = 20 + 100 = 120 ns
TLB Miss Time = 20 + (2 + 1) * 100 = 320 ns
EAT = 0.90 * 120 + 0.10 * 320 = 108 + 32 = 140 ns.

### Problem 4: Deadlock & Coffman Invariants (Weight: 10 marks)
Scenario: Can a system with single-instance resource types have a cycle in its Resource Allocation Graph (RAG) and NOT be deadlocked?
Answer: NO. In a system with only single instances of each resource type, a cycle in the RAG is both NECESSARY and SUFFICIENT for deadlock. Cycles can only exist without deadlock when resources have MULTIPLE instances.`,
        chunks: [
          {
            id: 'chunk-exam-1',
            docId: 'doc-cs301-past-exam',
            docTitle: 'Past Exam Paper: Midterm 2023 with Solutions.md',
            section: 'Problem 3: Multi-Level Paging EAT',
            text: 'TLB miss in 2-level paging requires accessing outer page table, inner page table, and target memory frame, yielding TLB Miss Time = TLB + 3 * Mem = 320 ns. Calculated EAT = 140 ns.',
            keywords: ['Past Exam', 'EAT', '2-Level Paging', 'Miss Penalty'],
          },
          {
            id: 'chunk-exam-2',
            docId: 'doc-cs301-past-exam',
            docTitle: 'Past Exam Paper: Midterm 2023 with Solutions.md',
            section: 'Problem 4: RAG Cycles & Single-Instance Resources',
            text: 'For single-instance resource graphs, a cycle is necessary and sufficient for deadlock. If multi-instance resources exist, a cycle is merely necessary, not sufficient.',
            keywords: ['Past Exam', 'RAG', 'Cycle', 'Deadlock Sufficient Condition'],
          },
        ],
      },
    ],
    topics: [
      {
        id: 'top-cs301-vm',
        courseId: 'course-cs301',
        unit: 'Unit 3: Virtual Memory & Paging',
        name: 'Virtual Memory & Page Replacement',
        description: 'Multi-level paging, TLB effective access time, Belady anomaly, LRU stack properties, and thrashing working set size.',
        weightage: 30,
        difficulty: 'Advanced',
        prerequisites: ['CPU Addressing', 'Hardware Caching'],
        relatedChunkIds: ['chunk-syl-2', 'chunk-vm-1', 'chunk-vm-2', 'chunk-vm-3', 'chunk-exam-1'],
        status: 'weak',
        masteryScore: 33,
        lastAssessed: '2026-10-25T16:20:00Z',
        questionsAttempted: 6,
        questionsCorrect: 2,
        diagnosisReason: 'Failed questions on TLB miss penalty calculation in multi-level page tables and confused Belady Anomaly conditions in stack vs non-stack replacement algorithms.',
        identifiedMisconceptions: [
          'Calculates TLB miss penalty as 2 memory accesses instead of 3 (omits data frame fetch)',
          'Assumes LRU can exhibit Belady\'s Anomaly under heavy page traffic',
        ],
        recommendedAction: 'Reread Lecture Notes Section 1 on EAT formulas and practice Worked Problem 3 from Midterm 2023.',
      },
      {
        id: 'top-cs301-deadlocks',
        courseId: 'course-cs301',
        unit: 'Unit 2: Concurrency & Synchronization',
        name: 'Deadlock Invariants & Safe State Verification',
        description: 'Coffman 4 conditions, Banker Algorithm safety vectors, Resource Allocation Graph cycle sufficiency, and starvation vs deadlock.',
        weightage: 30,
        difficulty: 'Advanced',
        prerequisites: ['Threads & Processes', 'Semaphores'],
        relatedChunkIds: ['chunk-syl-1', 'chunk-sync-2', 'chunk-exam-2'],
        status: 'weak',
        masteryScore: 40,
        lastAssessed: '2026-10-25T16:20:00Z',
        questionsAttempted: 5,
        questionsCorrect: 2,
        diagnosisReason: 'Confuses Unsafe States with Deadlocked States in Banker Algorithm; failed to distinguish single vs multi-instance resource graph cycle rules.',
        identifiedMisconceptions: [
          'Believes an unsafe state in Banker\'s Algorithm is already a deadlocked state',
          'Assumed a cycle in a multi-instance Resource Allocation Graph always guarantees deadlock',
        ],
        recommendedAction: 'Review Lecture 11 Section 3: Banker Safe vs Unsafe definition. Verify execution sequences on Paper 2023 Q4.',
      },
      {
        id: 'top-cs301-sync',
        courseId: 'course-cs301',
        unit: 'Unit 2: Concurrency & Synchronization',
        name: 'Critical Section & Synchronization Primitives',
        description: 'Mutual Exclusion, Progress, Bounded Waiting conditions, Semaphores wait()/signal() invariants, and Monitors.',
        weightage: 15,
        difficulty: 'Intermediate',
        prerequisites: ['Basic Multithreading'],
        relatedChunkIds: ['chunk-sync-1'],
        status: 'medium',
        masteryScore: 66,
        lastAssessed: '2026-10-25T16:20:00Z',
        questionsAttempted: 3,
        questionsCorrect: 2,
        diagnosisReason: 'Understands mutual exclusion well, but failed to identify violations of the Bounded Waiting condition leading to thread starvation.',
        identifiedMisconceptions: [
          'Overlooks bounded waiting when validating Peterson algorithm extensions',
        ],
        recommendedAction: 'Drill 2 past paper questions specifically evaluating bounded waiting proofs.',
      },
      {
        id: 'top-cs301-scheduling',
        courseId: 'course-cs301',
        unit: 'Unit 1: Process Scheduling',
        name: 'CPU Scheduling & Context Switching',
        description: 'Preemptive scheduling algorithms (Round Robin, SRTF, MLFQ), Gantt chart turnaround and waiting time, context switch costs.',
        weightage: 15,
        difficulty: 'Beginner',
        prerequisites: ['Process Control Blocks'],
        relatedChunkIds: [],
        status: 'strong',
        masteryScore: 90,
        lastAssessed: '2026-10-25T16:20:00Z',
        questionsAttempted: 4,
        questionsCorrect: 4,
        diagnosisReason: 'Flawless calculation of average waiting time, turnaround time, and MLFQ priority decay mechanics.',
        identifiedMisconceptions: [],
        recommendedAction: 'Maintain retention with 5-minute active recall drill 3 days before exam.',
      },
      {
        id: 'top-cs301-filesystem',
        courseId: 'course-cs301',
        unit: 'Unit 4: Storage & File Systems',
        name: 'File System Inodes & Crash Consistency',
        description: 'Inode pointer capacity calculations, journaling write-ahead log states, and fsck recovery.',
        weightage: 10,
        difficulty: 'Intermediate',
        prerequisites: ['Storage Hardware'],
        relatedChunkIds: [],
        status: 'unassessed',
        masteryScore: 0,
        lastAssessed: null,
        questionsAttempted: 0,
        questionsCorrect: 0,
        diagnosisReason: 'Topic has not yet been diagnostically tested. High exam risk due to unknown gap status.',
        identifiedMisconceptions: [],
        recommendedAction: 'Take a 3-question diagnostic quiz to establish baseline mastery score.',
      },
    ],
    gapReport: {
      id: 'gap-cs301-1',
      courseId: 'course-cs301',
      createdAt: '2026-10-25T16:22:00Z',
      examRiskScore: 72,
      overallVerdict: 'HIGH EXAM RISK: Critical conceptual gaps in Virtual Memory (33%) and Concurrency Deadlocks (40%), which together represent 60% of total exam weightage!',
      weakCount: 2,
      mediumCount: 1,
      strongCount: 1,
      unassessedCount: 1,
      topicDiagnoses: [
        {
          topicId: 'top-cs301-vm',
          status: 'weak',
          masteryScore: 33,
          diagnosisReason: 'Missed both EAT calculation questions due to omitting the target memory frame in multi-level paging TLB misses. Confused Belady stack property.',
          identifiedMisconceptions: [
            'Calculates TLB miss penalty as 2 memory accesses instead of 3 (omits data frame fetch)',
            'Believes LRU can exhibit Belady\'s Anomaly',
          ],
          recommendedAction: 'Study Lecture 14 Notes formula and rework Problem 3 from 2023 Midterm.',
        },
        {
          topicId: 'top-cs301-deadlocks',
          status: 'weak',
          masteryScore: 40,
          diagnosisReason: 'Failed to distinguish Unsafe state from Deadlock in Banker\'s Algorithm; misapplied cycle criteria to multi-instance resource allocation graphs.',
          identifiedMisconceptions: [
            'Equates unsafe state with deadlock state',
            'Believes RAG cycles always guarantee deadlock in multi-instance systems',
          ],
          recommendedAction: 'Work through Banker safety sequence table proof in Lecture 11.',
        },
        {
          topicId: 'top-cs301-sync',
          status: 'medium',
          masteryScore: 66,
          diagnosisReason: 'Solid on mutual exclusion, but missed questions concerning Bounded Waiting and potential starvation.',
          identifiedMisconceptions: [
            'Confuses absence of progress with absence of bounded waiting',
          ],
          recommendedAction: 'Review the 3 formal requirements of the Critical Section problem.',
        },
        {
          topicId: 'top-cs301-scheduling',
          status: 'strong',
          masteryScore: 90,
          diagnosisReason: 'Consistently solved turnaround and waiting time equations across pre-emption models.',
          identifiedMisconceptions: [],
          recommendedAction: 'Quick refresher flashcards before exam day.',
        },
      ],
    },
    revisionPlan: {
      id: 'rev-cs301-1',
      courseId: 'course-cs301',
      generatedAt: '2026-10-25T16:25:00Z',
      examDate: '2026-11-05',
      daysAvailable: 7,
      hoursPerDay: 2.5,
      totalAllocatedHours: 17.5,
      overallRiskLevel: 'High',
      overallStrategy: 'Allocating 78% of study hours directly to Virtual Memory and Deadlocks (the 2 highest-weightage weak topics). Days 1-4 eliminate critical cognitive traps; Day 5 tackles Medium synchronization; Day 6-7 synthesizes past papers.',
      days: [
        {
          dayNumber: 1,
          dateLabel: 'Day 1 (Mon)',
          focus: 'Virtual Memory — TLB Miss Formula & EAT Precision',
          blocks: [
            {
              id: 'b-1-1',
              topicId: 'top-cs301-vm',
              topicName: 'Virtual Memory & Page Replacement',
              priority: 'High',
              estimatedMinutes: 60,
              action: 'Line-by-line reading of Lecture 14: Derive EAT for 2-level, 3-level and inverted page tables. Write out all memory access steps on TLB miss.',
              sourceCitation: 'Notes: Lecture 14-16, Section 1 (TLB & EAT)',
              completed: true,
              type: 'concept_review',
            },
            {
              id: 'b-1-2',
              topicId: 'top-cs301-vm',
              topicName: 'Virtual Memory & Page Replacement',
              priority: 'High',
              estimatedMinutes: 60,
              action: 'Re-solve Midterm 2023 Problem 3 with varying hit rates (85%, 92%, 98%). Verify calculation without notes.',
              sourceCitation: 'Past Paper 2023: Midterm Problem 3',
              completed: false,
              type: 'worked_example',
            },
            {
              id: 'b-1-3',
              topicId: 'top-cs301-vm',
              topicName: 'Virtual Memory & Page Replacement',
              priority: 'Medium',
              estimatedMinutes: 30,
              action: 'Run a 3-question diagnostic quiz retake on Virtual Memory to confirm gap closure.',
              sourceCitation: 'GapFinder Diagnostic Engine',
              completed: false,
              type: 'active_recall',
            },
          ],
        },
        {
          dayNumber: 2,
          dateLabel: 'Day 2 (Tue)',
          focus: 'Virtual Memory — Belady Anomaly & Replacement Algorithms',
          blocks: [
            {
              id: 'b-2-1',
              topicId: 'top-cs301-vm',
              topicName: 'Virtual Memory & Page Replacement',
              priority: 'High',
              estimatedMinutes: 75,
              action: 'Trace reference string 1,2,3,4,1,2,5,1,2,3,4,5 across 3 vs 4 frames in FIFO to observe Belady anomaly firsthand. Contrast with LRU stack property proof.',
              sourceCitation: 'Notes: Section 2 (Page Replacement)',
              completed: false,
              type: 'concept_review',
            },
            {
              id: 'b-2-2',
              topicId: 'top-cs301-vm',
              topicName: 'Virtual Memory & Page Replacement',
              priority: 'Medium',
              estimatedMinutes: 45,
              action: 'Review Clock (second-chance) algorithm reference bit handling under high page fault rates.',
              sourceCitation: 'Lecture 15 Notes',
              completed: false,
              type: 'worked_example',
            },
            {
              id: 'b-2-3',
              topicId: 'top-cs301-scheduling',
              topicName: 'CPU Scheduling & Context Switching',
              priority: 'Low',
              estimatedMinutes: 30,
              action: 'Active Recall Check: Fast 10-minute Gantt chart calculation to maintain strong retention.',
              sourceCitation: 'Summary Sheet Unit 1',
              completed: false,
              type: 'active_recall',
            },
          ],
        },
        {
          dayNumber: 3,
          dateLabel: 'Day 3 (Wed)',
          focus: 'Deadlocks — Safe States vs Deadlock & Banker Vector Math',
          blocks: [
            {
              id: 'b-3-1',
              topicId: 'top-cs301-deadlocks',
              topicName: 'Deadlock Invariants & Safe State Verification',
              priority: 'High',
              estimatedMinutes: 75,
              action: 'Address Misconception: Re-read safe vs unsafe definitions. Draw Venn diagram showing Deadlock as a subset of Unsafe states.',
              sourceCitation: 'Notes: Lecture 11 Section 3',
              completed: false,
              type: 'concept_review',
            },
            {
              id: 'b-3-2',
              topicId: 'top-cs301-deadlocks',
              topicName: 'Deadlock Invariants & Safe State Verification',
              priority: 'High',
              estimatedMinutes: 75,
              action: 'Execute Banker Algorithm Safety Algorithm with 5 processes and 3 resource types (Available, Allocation, Max, Need vectors). Find all valid safe execution sequences.',
              sourceCitation: 'Midterm 2023 Problem 4 & Notes',
              completed: false,
              type: 'worked_example',
            },
          ],
        },
        {
          dayNumber: 4,
          dateLabel: 'Day 4 (Thu)',
          focus: 'Deadlocks & Resource Allocation Graphs (Single vs Multi-Instance)',
          blocks: [
            {
              id: 'b-4-1',
              topicId: 'top-cs301-deadlocks',
              topicName: 'Deadlock Invariants & Safe State Verification',
              priority: 'High',
              estimatedMinutes: 60,
              action: 'Practice distinguishing RAG graphs: Construct a counterexample showing a cycle in a multi-instance graph that DOES NOT deadlock.',
              sourceCitation: 'Lecture 11 Invariants & Past Exam 2023',
              completed: false,
              type: 'worked_example',
            },
            {
              id: 'b-4-2',
              topicId: 'top-cs301-deadlocks',
              topicName: 'Deadlock Invariants & Safe State Verification',
              priority: 'High',
              estimatedMinutes: 60,
              action: 'Diagnostic Retake: Complete Deadlock re-test to update topic mastery score.',
              sourceCitation: 'GapFinder Diagnostic Engine',
              completed: false,
              type: 'active_recall',
            },
            {
              id: 'b-4-3',
              topicId: 'top-cs301-filesystem',
              topicName: 'File System Inodes & Crash Consistency',
              priority: 'Medium',
              estimatedMinutes: 30,
              action: 'Initial baseline assessment: Take 3 diagnostic questions on Inodes and Journaling.',
              sourceCitation: 'Syllabus Unit 4',
              completed: false,
              type: 'concept_review',
            },
          ],
        },
        {
          dayNumber: 5,
          dateLabel: 'Day 5 (Fri)',
          focus: 'Synchronization — Bounded Waiting & Starvation Proofs',
          blocks: [
            {
              id: 'b-5-1',
              topicId: 'top-cs301-sync',
              topicName: 'Critical Section & Synchronization Primitives',
              priority: 'High',
              estimatedMinutes: 75,
              action: 'Study bounded waiting proof in Peterson Algorithm. Analyze how semaphores with FIFO vs arbitrary wakeup queues affect bounded waiting.',
              sourceCitation: 'Notes: Lecture 9 Section 1',
              completed: false,
              type: 'concept_review',
            },
            {
              id: 'b-5-2',
              topicId: 'top-cs301-sync',
              topicName: 'Critical Section & Synchronization Primitives',
              priority: 'Medium',
              estimatedMinutes: 75,
              action: 'Solve Producer-Consumer bounded buffer problem using counting and binary semaphores without deadlocks or buffer overflows.',
              sourceCitation: 'Lecture 10 Code Walkthroughs',
              completed: false,
              type: 'worked_example',
            },
          ],
        },
        {
          dayNumber: 6,
          dateLabel: 'Day 6 (Sat)',
          focus: 'Cross-Topic Synthesis & Past Paper Time Trial',
          blocks: [
            {
              id: 'b-6-1',
              topicId: 'top-cs301-vm',
              topicName: 'Comprehensive Exam Synthesis',
              priority: 'High',
              estimatedMinutes: 90,
              action: 'Timed 90-minute full exam paper simulation combining VM, Deadlocks, Scheduling, and Synchronization.',
              sourceCitation: '2024 Final Exam Mock Paper',
              completed: false,
              type: 'past_paper_drill',
            },
            {
              id: 'b-6-2',
              topicId: 'top-cs301-vm',
              topicName: 'Comprehensive Exam Synthesis',
              priority: 'High',
              estimatedMinutes: 60,
              action: 'Review incorrect problems with Explain-This-Topic assistant to verify source citations.',
              sourceCitation: 'GapFinder AI Assistant',
              completed: false,
              type: 'active_recall',
            },
          ],
        },
        {
          dayNumber: 7,
          dateLabel: 'Day 7 (Sun)',
          focus: 'Final Gap Calibration & Peak Readiness',
          blocks: [
            {
              id: 'b-7-1',
              topicId: 'top-cs301-vm',
              topicName: 'Final Diagnostic Run',
              priority: 'High',
              estimatedMinutes: 60,
              action: 'Run comprehensive final GapFinder diagnostic to verify all weak topics have transitioned to Strong/Medium (>75%).',
              sourceCitation: 'GapFinder AI Diagnostic Engine',
              completed: false,
              type: 'active_recall',
            },
            {
              id: 'b-7-2',
              topicId: 'top-cs301-scheduling',
              topicName: 'High-Yield Formula Review',
              priority: 'Medium',
              estimatedMinutes: 60,
              action: 'Formula sheet active recall: EAT, Working Set Model thresholds, Inode pointer max file sizes.',
              sourceCitation: 'Course Formula & Invariant Reference',
              completed: false,
              type: 'concept_review',
            },
          ],
        },
      ],
    },
    quizHistory: [
      {
        id: 'quiz-sess-1',
        courseId: 'course-cs301',
        startedAt: '2026-10-25T16:00:00Z',
        completedAt: '2026-10-25T16:20:00Z',
        score: 55,
        evaluated: true,
        questions: [
          {
            id: 'q-demo-1',
            topicId: 'top-cs301-vm',
            topicName: 'Virtual Memory & Page Replacement',
            type: 'conceptual_mcq',
            prompt: 'In a 2-level paging system with memory access time of 100 ns and TLB search time of 20 ns, what is the exact time required to fetch an instruction or data word on a TLB MISS (assuming no page fault)?',
            options: [
              '120 ns (TLB search + 1 memory reference)',
              '220 ns (TLB search + 2 memory references for page tables)',
              '320 ns (TLB search + 2 page table accesses + 1 data frame access)',
              '420 ns (TLB search + 4 memory accesses)',
            ],
            correctIndex: 2,
            citation: {
              docTitle: 'Lecture 14-16: Virtual Memory, TLB & Replacement Notes.md',
              section: '1. TLB Effective Access Time Calculation',
              excerpt: 'In a 2-level page table, a TLB miss incurs 2 page table memory references plus 1 data memory reference (3 total memory accesses). Miss time = TLB + (2 + 1) * Mem.',
            },
            explanation: 'On a TLB miss, the CPU must look up the Level 1 (outer) page table in RAM, then the Level 2 page table in RAM, and finally access the physical data frame itself. Total memory accesses = 2 + 1 = 3. Total time = 20 + 3 * 100 = 320 ns.',
            distractorRationales: {
              0: 'Omits page table traversals entirely; only accounts for data access.',
              1: 'CRITICAL TRAP: Forgot to fetch the actual data frame after traversing the 2 page tables!',
              3: 'Overcounts page table depth by two levels.',
            },
            commonTrap: 'Forgetting that translating the virtual address only yields the physical frame; the data word still needs to be fetched from memory!',
          },
          {
            id: 'q-demo-2',
            topicId: 'top-cs301-vm',
            topicName: 'Virtual Memory & Page Replacement',
            type: 'conceptual_mcq',
            prompt: 'Why is LRU (Least Recently Used) replacement mathematically immune to Belady\'s Anomaly, whereas FIFO can suffer from it?',
            options: [
              'Because LRU maintains hardware reference bits that prevent faults',
              'Because LRU is a stack algorithm where the page set for N frames is always a strict subset of N+1 frames',
              'Because LRU only evicts pages that have dirty bits cleared to 0',
              'Because LRU prioritizes recently accessed processes over older processes',
            ],
            correctIndex: 1,
            citation: {
              docTitle: 'Lecture 14-16: Virtual Memory, TLB & Replacement Notes.md',
              section: '2. Beladys Anomaly & LRU Stack Property',
              excerpt: 'Stack algorithms like LRU never suffer from Beladys Anomaly because pages in memory of size n is a subset of size n+1.',
            },
            explanation: 'In stack algorithms like LRU and OPT, the memory contents for capacity N at any time t is guaranteed to be a subset of the contents for capacity N+1. Therefore, increasing frame count can never increase page faults.',
            distractorRationales: {
              0: 'Reference bits belong to Clock approximation, not the formal proof of LRU stack inclusion.',
              2: 'Dirty bit eviction affects write-back disk latency, not Belady anomaly frequency.',
              3: 'LRU works at the page level within/across spaces, not just process age.',
            },
            commonTrap: 'Confusing empirical cache behavior with formal inclusion (stack) properties.',
          },
          {
            id: 'q-demo-3',
            topicId: 'top-cs301-deadlocks',
            topicName: 'Deadlock Invariants & Safe State Verification',
            type: 'conceptual_mcq',
            prompt: 'Under Banker\'s Algorithm for deadlock avoidance, which statement accurately characterizes the relationship between an "Unsafe State" and a "Deadlock State"?',
            options: [
              'An unsafe state is strictly identical to a deadlock state.',
              'A deadlock state is an unsafe state, but an unsafe state is not necessarily deadlocked.',
              'An unsafe state cannot transition into a deadlock state without hardware preemption.',
              'Deadlock states are safe states that encountered resource starvation.',
            ],
            correctIndex: 1,
            citation: {
              docTitle: 'Lecture 9-11: Synchronization, Mutex & Deadlocks.md',
              section: '3. Banker Algorithm Safe State vs Deadlock',
              excerpt: 'An unsafe state is not automatically a deadlock state. An unsafe state implies the operating system cannot guarantee avoidance of deadlock if all processes simultaneously demand their peak claim.',
            },
            explanation: 'Deadlock is a strict subset of unsafe states. An unsafe state simply means the system cannot guarantee avoidance of deadlock if processes request their maximum allowable claim; but if processes finish without requesting max claims, execution may proceed smoothly.',
            distractorRationales: {
              0: 'Very common misconception! Students incorrectly think unsafe = system already frozen in deadlock.',
              2: 'Preemption would break one of the Coffman conditions and resolve deadlock.',
              3: 'Deadlock states can never be safe states by definition.',
            },
            commonTrap: 'Equating unsafe state with deadlock state.',
          },
        ],
        userAnswers: {
          'q-demo-1': 1, // Student picked 220 ns (missed data fetch! Triggered trap!)
          'q-demo-2': 0, // Student guessed reference bits
          'q-demo-3': 0, // Student picked identical! Triggered trap!
        },
      },
    ],
  },
  {
    id: 'course-bio102',
    title: 'Molecular Cell Biology & Genetics',
    code: 'BIO 102',
    department: 'Biological Sciences',
    examDate: '2026-11-12',
    daysRemaining: 17,
    studyHoursPerDay: 2.0,
    documents: [
      {
        id: 'doc-bio-syl',
        title: 'BIO 102 Syllabus & Exam Guide.md',
        type: 'syllabus',
        uploadedAt: '2026-10-18T09:00:00Z',
        wordCount: 750,
        content: `# BIO 102: Molecular Cell Biology Syllabus
Key Topics:
1. Cellular Respiration & Chemiosmosis (Glycolysis, Krebs cycle, Electron Transport Chain, ATP Synthase proton-motive force)
2. DNA Replication Machinery & Fidelity (Leading vs Lagging strand, DNA Polymerase III proofreading, Okazaki fragments, Telomerase)
3. Transcription, Translation & Post-Translational Modifications
4. CRISPR-Cas9 & Gene Editing Mechanisms (Guide RNA, PAM sequence recognition, double-strand break repair)`,
        chunks: [
          {
            id: 'chunk-bio-1',
            docId: 'doc-bio-syl',
            docTitle: 'BIO 102 Syllabus & Exam Guide.md',
            section: 'Unit 1: Chemiosmosis and Proton Gradient',
            text: 'ATP synthesis by ATP Synthase relies strictly on the electrochemical proton gradient across the inner mitochondrial membrane into the intermembrane space.',
            keywords: ['ATP Synthase', 'Proton gradient', 'Chemiosmosis'],
          },
        ],
      },
      {
        id: 'doc-bio-notes',
        title: 'Lecture Notes: DNA Replication & Okazaki Processing.md',
        type: 'notes',
        uploadedAt: '2026-10-19T11:20:00Z',
        wordCount: 920,
        content: `# DNA Replication Mechanics
- DNA Polymerase can ONLY synthesize in the 5' -> 3' direction.
- The lagging strand must be synthesized discontinuously as Okazaki fragments.
- RNA primers synthesized by Primase are excised by DNA Polymerase I (in prokaryotes) using 5'->3' exonuclease activity, and gaps are sealed by DNA Ligase.`,
        chunks: [
          {
            id: 'chunk-bio-2',
            docId: 'doc-bio-notes',
            docTitle: 'Lecture Notes: DNA Replication & Okazaki Processing.md',
            section: 'Lagging Strand Priming and Ligase Action',
            text: 'DNA Polymerase I removes RNA primers via 5 to 3 exonuclease activity and replaces them with deoxynucleotides before DNA Ligase catalyzes phosphodiester bond formation.',
            keywords: ['DNA Polymerase I', 'Exonuclease', 'Ligase', 'Okazaki fragments'],
          },
        ],
      },
    ],
    topics: [
      {
        id: 'top-bio-rep',
        courseId: 'course-bio102',
        unit: 'Unit 2: Molecular Genetics',
        name: 'DNA Replication & Okazaki Processing',
        description: 'Directional synthesis 5\' to 3\', primer removal by DNA Pol I, and Ligase nick sealing.',
        weightage: 35,
        difficulty: 'Intermediate',
        prerequisites: ['Nucleic Acid Chemistry'],
        relatedChunkIds: ['chunk-bio-2'],
        status: 'weak',
        masteryScore: 42,
        lastAssessed: '2026-10-24T12:00:00Z',
        questionsAttempted: 4,
        questionsCorrect: 1,
        diagnosisReason: 'Failed questions on the specific enzyme responsible for RNA primer degradation vs gap filling.',
        identifiedMisconceptions: [
          'Confused DNA Pol III with DNA Pol I primer removal role',
        ],
        recommendedAction: 'Review Lecture Notes: DNA Replication & Okazaki Processing section on 5\'->3\' exonuclease.',
      },
      {
        id: 'top-bio-resp',
        courseId: 'course-bio102',
        unit: 'Unit 1: Bioenergetics',
        name: 'Cellular Respiration & Chemiosmosis',
        description: 'Proton-motive force, ATP synthase rotation, and electron transport chain complexes.',
        weightage: 35,
        difficulty: 'Advanced',
        prerequisites: ['Thermodynamics'],
        relatedChunkIds: ['chunk-bio-1'],
        status: 'medium',
        masteryScore: 68,
        lastAssessed: '2026-10-24T12:00:00Z',
        questionsAttempted: 4,
        questionsCorrect: 3,
        diagnosisReason: 'Good understanding of overall ATP yield, but confused Complex II non-proton pumping characteristics.',
        identifiedMisconceptions: ['Assumes all four respiratory complexes pump protons into the intermembrane space'],
        recommendedAction: 'Check Complex II (succinate dehydrogenase) proton transfer pathway.',
      },
      {
        id: 'top-bio-crispr',
        courseId: 'course-bio102',
        unit: 'Unit 4: Biotechnology',
        name: 'CRISPR-Cas9 & Gene Editing',
        description: 'PAM sequence recognition (NGG), sgRNA hybridization, and NHEJ vs HDR repair pathways.',
        weightage: 30,
        difficulty: 'Intermediate',
        prerequisites: ['DNA Repair Mechanisms'],
        relatedChunkIds: [],
        status: 'strong',
        masteryScore: 88,
        lastAssessed: '2026-10-24T12:00:00Z',
        questionsAttempted: 3,
        questionsCorrect: 3,
        diagnosisReason: 'Mastered PAM motif requirements and Cas9 endonuclease cleavage site offset.',
        identifiedMisconceptions: [],
        recommendedAction: 'Light review before exam day.',
      },
    ],
    gapReport: {
      id: 'gap-bio-1',
      courseId: 'course-bio102',
      createdAt: '2026-10-24T12:05:00Z',
      examRiskScore: 54,
      overallVerdict: 'MODERATE EXAM RISK: Weakness identified in DNA Replication primer processing (42%). Chemiosmosis is moderate.',
      weakCount: 1,
      mediumCount: 1,
      strongCount: 1,
      unassessedCount: 0,
      topicDiagnoses: [
        {
          topicId: 'top-bio-rep',
          status: 'weak',
          masteryScore: 42,
          diagnosisReason: 'Struggled with enzymatic roles in Okazaki fragment maturation.',
          identifiedMisconceptions: ['Confused DNA Pol III with DNA Pol I primer removal role'],
          recommendedAction: 'Review Lecture Notes: DNA Replication.',
        },
      ],
    },
    revisionPlan: null,
    quizHistory: [],
  },
];
