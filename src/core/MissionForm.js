// src/core/MissionForm.js
import React, { useState } from "react";
import { addMission, updateMission } from "./missions.js";

export default function MissionForm({ userId, ownerType = "user", mission = null, onSave }) {
  const [title, setTitle] = useState(mission?.title || "");
  const [description, setDescription] = useState(mission?.description || "");
  const [category, setCategory] = useState(mission?.category || "Personal");
  const [points, setPoints] = useState(mission?.points || 10);
  const [priority, setPriority] = useState(mission?.priority || "medium");
  const [recurrence, setRecurrence] = useState(mission?.recurrence || "");
  const [customInterval, setCustomInterval] = useState(mission?.customInterval || 0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  // persist advanced toggle per user
  const advKey = userId ? `missionForm.advanced.${userId}` : `missionForm.advanced`;

  React.useEffect(() => {
    try {
      const v = localStorage.getItem(advKey);
      if (v !== null) setShowAdvanced(v === '1');
    } catch (e) {
      // noop
    }
  }, [advKey]);
  const [tagString, setTagString] = useState("");
  const [tags, setTags] = useState(mission?.tags?.slice() || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const missionData = {
      title,
      description,
      category,
      points: Number(points),
      priority,
      recurrence: recurrence || null,
      customInterval: recurrence === "custom" ? Number(customInterval) : 0,
      tags: tags.slice(),
      ownerType,
      ownerId: userId,
    };

    let saved;
    if (mission) {
      saved = updateMission(mission.id, missionData, ownerType, userId);
    } else {
      saved = addMission(missionData);
    }

    if (onSave) onSave(saved);
    setTitle(""); setDescription(""); setCategory("Personal");
    setPoints(10); setPriority("medium"); setRecurrence(""); setCustomInterval(0); setTags([]); setTagString("");
  };

  return (
    <form onSubmit={handleSubmit} className="mission-form">
      <h2 className="form-title">{mission ? "Edit Mission" : "New Mission"}</h2>
      <div className="small muted subtitle">Create a mission and assign tags, priority and recurrence.</div>

      <div className="field">
        <label className="small muted">Title</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div className="field">
        <label className="small muted">Description</label>
        <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
      </div>

      <div className="field form-row">
        <div className="col">
          <label className="small muted">Category</label>
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Personal</option>
            <option>Work</option>
            <option>Fitness</option>
            <option>Study</option>
          </select>
        </div>

        <div className="col-fixed-110">
          <label className="small muted">Points</label>
          <input className="input" type="number" value={points} onChange={e => setPoints(e.target.value)} />
        </div>

        <div className="col-fixed-140">
          <label className="small muted">Priority</label>
          <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="small muted">More options</div>
        <button type="button" className="btn secondary advanced-toggle" onClick={() => {
          const next = !showAdvanced;
          setShowAdvanced(next);
          try { localStorage.setItem(advKey, next ? '1' : '0'); } catch(e){}
        }}>{showAdvanced ? 'Hide advanced' : 'Advanced'}</button>
      </div>

      {showAdvanced && (
        <div className="field form-row align-end">
          <div className="col">
            <label className="small muted">Recurrence</label>
            <select className="input" value={recurrence} onChange={e => setRecurrence(e.target.value)}>
              <option value="">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {recurrence === "custom" && (
            <div className="col-fixed-160">
              <label className="small muted">Custom Interval (days)</label>
              <input className="input" type="number" value={customInterval} onChange={e => setCustomInterval(e.target.value)} min="1" />
            </div>
          )}
        </div>
      )}

      <div className="field">
        <label className="small muted">Tags</label>
        <div className="tag-row">
          {tags.map(t => (
            <span key={t} className="chip" onClick={() => setTags(tags.filter(x => x !== t))}>{t} ×</span>
          ))}
          <input className="input tag-input" value={tagString} onChange={e => setTagString(e.target.value)} placeholder="Add a tag and press Enter" onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const v = tagString.trim();
              if (v && !tags.includes(v)) setTags([...tags, v]);
              setTagString('');
            }
          }} />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn" type="submit">{mission ? "Update Mission" : "Add Mission"}</button>
      </div>
    </form>
  );
}
