'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, getEndorsements, getSocialMedia, getProjects, getCertificates, getCVs, getOpenSource, addEndorsement } from '@/api/profileService';
import { sendConnectionRequest } from '@/api/socialService';
import { createChannel } from '@/api/chatService';
import { getReputation } from '@/api/communityService';
import { useAuthStore } from '@/store/authStore';
import { getDisplayName, getInitials, formatDate } from '@/lib/utils';
import { MapPin, Globe, Github, UserPlus, MessageSquare, Download, ExternalLink, Award, Star, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [profileId, setProfileId] = useState('');
  if (!profileId) {
    params.then(({ id }) => setProfileId(id));
    return null;
  }
  return <ProfileContent profileId={profileId} />;
}

function ProfileContent({ profileId }: { profileId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: profileData, isLoading } = useQuery({ queryKey: ['profile', profileId], queryFn: () => getProfile(profileId) });
  const { data: endorsementsData } = useQuery({ queryKey: ['endorsements', profileId], queryFn: () => getEndorsements(profileId) });
  const { data: socialData } = useQuery({ queryKey: ['social-media', profileId], queryFn: () => getSocialMedia(profileId) });
  const { data: projectsData } = useQuery({ queryKey: ['projects', profileId], queryFn: () => getProjects(profileId) });
  const { data: certsData } = useQuery({ queryKey: ['certificates', profileId], queryFn: () => getCertificates(profileId) });
  const { data: cvsData } = useQuery({ queryKey: ['cvs', profileId], queryFn: () => getCVs(profileId) });
  const { data: repData } = useQuery({ queryKey: ['reputation', profileData?.data?.userId], queryFn: () => getReputation(profileData!.data!.userId), enabled: !!profileData?.data?.userId });

  const { mutate: connect, isPending: connecting } = useMutation({
    mutationFn: () => sendConnectionRequest(profileData!.data!.userId),
    onSuccess: () => { toast.success('Connection request sent!'); qc.invalidateQueries({ queryKey: ['connections'] }); },
    onError: () => toast.error('Failed to send request'),
  });

  const { mutate: message, isPending: messaging } = useMutation({
    mutationFn: () => createChannel(profileData!.data!.userId),
    onSuccess: () => router.push('/messages'),
    onError: () => toast.error('Failed to start conversation'),
  });

  const [endorsingSkill, setEndorsingSkill] = useState<string | null>(null);
  const { mutate: endorse } = useMutation({
    mutationFn: (skill: string) => addEndorsement(profileId, skill),
    onSuccess: (_, skill) => {
      toast.success(`Endorsed "${skill}"!`);
      qc.invalidateQueries({ queryKey: ['endorsements', profileId] });
      setEndorsingSkill(null);
    },
    onError: () => { toast.error('Failed to endorse'); setEndorsingSkill(null); },
  });

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  const profile = profileData?.data;
  if (!profile) return <div className="p-8 text-center text-slate-500">Profile not found</div>;

  const profileUser = profile.user;
  const displayName = profileUser ? getDisplayName(profileUser) : 'Unknown';
  const initials = profileUser ? getInitials(profileUser.firstName, profileUser.lastName, profileUser.email) : 'FC';
  const isOwnProfile = user?.id === profile.userId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-500 to-blue-700" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-xl font-bold overflow-hidden">
              {profileUser?.avatarUrl ? (
                <img src={profileUser.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : initials}
            </div>
            <div className="flex items-center gap-2">
              {repData?.data && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{repData.data.score}</span>
                </div>
              )}
              {!isOwnProfile && user && (
                <>
                  <button
                    onClick={() => message()}
                    disabled={messaging}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                  >
                    {messaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    Message
                  </button>
                  <button
                    onClick={() => connect()}
                    disabled={connecting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Connect
                  </button>
                </>
              )}
              {isOwnProfile && (
                <Link href="/profile/edit" className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
          {profile.headline && <p className="text-slate-500 mt-0.5">{profile.headline}</p>}

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
            {profile.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{profile.location}</span>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline"><Globe className="w-4 h-4" />Website</a>}
          </div>

          {/* Social media links */}
          {socialData?.data && socialData.data.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {socialData.data.map((sm) => (
                <a key={sm.id} href={sm.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {sm.platform}
                </a>
              ))}
            </div>
          )}

          {profile.bio && <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{profile.bio}</p>}
        </div>
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <div key={skill} className="flex items-center gap-1">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {skill}
                </span>
                {!isOwnProfile && user && (
                  <button
                    onClick={() => { setEndorsingSkill(skill); endorse(skill); }}
                    disabled={endorsingSkill === skill}
                    title={`Endorse ${skill}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                  >
                    {endorsingSkill === skill ? <Loader2 className="w-3 h-3 animate-spin" /> : '+1'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CVs */}
      {cvsData?.data && cvsData.data.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Resume / CV</h2>
          <div className="space-y-2">
            {cvsData.data.map((cv) => (
              <a key={cv.id} href={cv.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                <Download className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{cv.fileName}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certsData?.data && certsData.data.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Certificates</h2>
          <div className="space-y-3">
            {certsData.data.map((cert) => (
              <div key={cert.id} className="flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{cert.name}</p>
                  <p className="text-xs text-slate-500">{cert.issuer} · {formatDate(cert.issueDate)}</p>
                  {cert.expiryDate && <p className="text-xs text-slate-400">Expires: {formatDate(cert.expiryDate)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projectsData?.data && projectsData.data.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Personal Projects</h2>
          <div className="space-y-4">
            {projectsData.data.map((project) => (
              <div key={project.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                {project.description && <p className="text-sm text-slate-500">{project.description}</p>}
                <div className="flex flex-wrap gap-2">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                      <Github className="w-3.5 h-3.5" />GitHub
                    </a>
                  )}
                  {project.deployUrl && (
                    <a href={project.deployUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" />Live
                    </a>
                  )}
                </div>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endorsements */}
      {endorsementsData?.data && endorsementsData.data.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Endorsements</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              endorsementsData.data.reduce((acc, e) => {
                acc[e.skill] = (acc[e.skill] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([skill, count]) => (
              <div key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">{skill}</span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
