/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const MOODS = ["Calm", "Cozy", "Mysterious", "Ethereal", "Melancholy", "Dreamy"];
const CAMERA_MOVEMENTS = ["Static", "Slow Pan", "Slow Zoom In", "Slow Zoom Out", "Dolly", "Handheld"];
const CAMERA_ANGLES = ["Eye-level", "Low Angle", "High Angle", "Dutch Angle", "Close-up", "Wide Shot"];
const CAMERA_FOCUS = ["Soft Focus", "Deep Focus", "Rack Focus", "Shallow Depth of Field"];
const PRIMARY_SOUNDS = ["Rain", "Fireplace", "Wind", "Ocean Waves", "Forest Ambience", "Keyboard Typing", "None"];
const SECONDARY_SOUNDS = ["Thunder", "Birds Chirping", "Pages Turning", "Whispering", "Ticking Clock", "Purring Cat"];
const SOUND_QUALITIES = ["High-Fidelity (Binaural)", "Lo-fi", "Muffled", "Crisp"];
const VISUAL_EFFECTS = ["Soft Glow", "Fog", "Muted Tones", "Film Grain", "Lens Flare", "Dust Particles"];

const PRESETS = [
  {
    name: "Forest Rain",
    settings: {
      moods: ["Calm", "Melancholy"],
      cameraMovement: "Slow Zoom In",
      cameraAngle: "Low Angle",
      cameraFocus: "Soft Focus",
      soundscapePrimary: "Rain",
      soundscapeSecondary: ["Thunder", "Wind"],
      soundscapeQuality: "High-Fidelity (Binaural)",
      visualEffects: ["Fog", "Muted Tones"],
    }
  },
  {
    name: "Cozy Fireplace",
    settings: {
      moods: ["Cozy", "Calm"],
      cameraMovement: "Static",
      cameraAngle: "Eye-level",
      cameraFocus: "Shallow Depth of Field",
      soundscapePrimary: "Fireplace",
      soundscapeSecondary: ["Ticking Clock", "Purring Cat"],
      soundscapeQuality: "High-Fidelity (Binaural)",
      visualEffects: ["Soft Glow", "Film Grain"],
    }
  },
  {
    name: "Late Night Study",
    settings: {
      moods: ["Calm", "Cozy"],
      cameraMovement: "Slow Pan",
      cameraAngle: "High Angle",
      cameraFocus: "Rack Focus",
      soundscapePrimary: "Keyboard Typing",
      soundscapeSecondary: ["Pages Turning", "Whispering"],
      soundscapeQuality: "Crisp",
      visualEffects: ["Soft Glow", "Dust Particles"],
    }
  },
  {
    name: "Ethereal Dream",
    settings: {
      moods: ["Ethereal", "Dreamy", "Mysterious"],
      cameraMovement: "Dolly",
      cameraAngle: "Wide Shot",
      cameraFocus: "Soft Focus",
      soundscapePrimary: "Wind",
      soundscapeSecondary: [],
      soundscapeQuality: "Muffled",
      visualEffects: ["Soft Glow", "Fog", "Muted Tones"],
    }
  }
];

const initialState = {
  idea: '',
  moods: [],
  cameraMovement: CAMERA_MOVEMENTS[0],
  cameraAngle: CAMERA_ANGLES[0],
  cameraFocus: CAMERA_FOCUS[0],
  soundscapePrimary: PRIMARY_SOUNDS[0],
  soundscapeSecondary: [],
  soundscapeQuality: SOUND_QUALITIES[0],
  visualEffects: [],
};

const FormControl = ({ label, children }) => (
  <div className="form-control">
    <label>{label}</label>
    {children}
  </div>
);

const MultiSelectGroup = ({ items, selectedItems, onToggle }) => (
  <div className="multi-select-group">
    {items.map(item => (
      <button
        key={item}
        className={`chip ${selectedItems.includes(item) ? 'active' : ''}`}
        onClick={() => onToggle(item)}
        aria-pressed={selectedItems.includes(item)}
      >
        {item}
      </button>
    ))}
  </div>
);

const SelectControl = ({ value, onChange, options }) => (
  <div className="select-wrapper">
    <select className="select" value={value} onChange={onChange}>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

export default function App() {
  const [formState, setFormState] = useState(initialState);
  const [generatedJson, setGeneratedJson] = useState(null);
  const [validationStatus, setValidationStatus] = useState('unchecked');
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [theme, setTheme] = useState(localStorage.getItem('asmr-veo-theme') || 'dark');
  const [effectiveTheme, setEffectiveTheme] = useState(theme);

  useEffect(() => {
    const applyTheme = (t) => {
      if (t === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        setEffectiveTheme('light');
      } else {
        document.documentElement.removeAttribute('data-theme');
        setEffectiveTheme('dark');
      }
    };

    const handleSystemThemeChange = (e) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('asmr-veo-theme', newTheme);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const toggleMultiSelect = (item, field) => {
    setFormState(prev => {
      const currentSelection = prev[field];
      const newSelection = currentSelection.includes(item)
        ? currentSelection.filter(i => i !== item)
        : [...currentSelection, item];
      return { ...prev, [field]: newSelection };
    });
  };

  const handleApplyPreset = useCallback((preset) => {
    setFormState(prev => ({
      ...prev,
      ...preset.settings
    }));
  }, []);

  const handleGenerateJson = useCallback(() => {
    const { idea, ...rest } = formState;
    const jsonObject = {
      title: idea,
      description: `An ASMR-style video about: ${idea}.`,
      style: "ASMR",
      mood: rest.moods,
      camera: {
        movement: rest.cameraMovement,
        angle: rest.cameraAngle,
        focus: rest.cameraFocus,
      },
      soundscape: {
        primary: rest.soundscapePrimary,
        secondary: rest.soundscapeSecondary,
        quality: rest.soundscapeQuality,
      },
      visual_effects: rest.visualEffects,
    };
    setGeneratedJson(JSON.stringify(jsonObject, null, 2));
    setValidationStatus('unchecked');
  }, [formState]);

  const handleReset = useCallback(() => {
    setFormState(initialState);
    setGeneratedJson(null);
    setValidationStatus('unchecked');
  }, []);

  const handleCopyJson = useCallback(() => {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    });
  }, [generatedJson]);

  const handleDownloadJson = useCallback(() => {
    if (!generatedJson) return;
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = formState.idea.trim().toLowerCase().replace(/\s+/g, '_') || 'prompt';
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedJson, formState.idea]);

  const handleSelfTest = useCallback(() => {
    if (!generatedJson) return;
    try {
      const parsed = JSON.parse(generatedJson);
      const requiredKeys = ["title", "description", "style", "mood", "camera", "soundscape", "visual_effects"];
      const hasAllKeys = requiredKeys.every(key => key in parsed);
      const cameraKeysOk = "movement" in parsed.camera && "angle" in parsed.camera && "focus" in parsed.camera;
      const soundscapeKeysOk = "primary" in parsed.soundscape && "secondary" in parsed.soundscape && "quality" in parsed.soundscape;
      
      if (hasAllKeys && cameraKeysOk && soundscapeKeysOk) {
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
      }
    } catch (e) {
      setValidationStatus('invalid');
    }
  }, [generatedJson]);

  return (
    <div className="container">
      <header>
        <div>
          <h1>ASMR Veo 3 JSON Prompt Generator</h1>
          <p>Turn simple ideas into structured, creative JSON prompts for Google Veo 3.</p>
        </div>
        <div className="theme-switcher">
          <button className={`chip ${theme === 'dark' ? 'active' : ''}`} onClick={() => handleSetTheme('dark')} aria-pressed={theme === 'dark'}>
            <span className="icon">dark_mode</span> Dark
          </button>
          <button className={`chip ${theme === 'light' ? 'active' : ''}`} onClick={() => handleSetTheme('light')} aria-pressed={theme === 'light'}>
            <span className="icon">light_mode</span> Light
          </button>
          <button className={`chip ${theme === 'system' ? 'active' : ''}`} onClick={() => handleSetTheme('system')} aria-pressed={theme === 'system'}>
            <span className="icon">desktop_windows</span> System
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="controls-panel">
          <FormControl label="Your Idea">
            <input
              type="text"
              name="idea"
              className="input"
              placeholder="e.g., forest rain at night"
              value={formState.idea}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl label="Start with a Preset">
            <div className="multi-select-group">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  className="chip"
                  onClick={() => handleApplyPreset(preset)}
                  title={`Apply the "${preset.name}" preset`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </FormControl>

          <FormControl label="Mood">
            <MultiSelectGroup items={MOODS} selectedItems={formState.moods} onToggle={(item) => toggleMultiSelect(item, 'moods')} />
          </FormControl>

          <FormControl label="Camera">
            <SelectControl value={formState.cameraMovement} onChange={e => setFormState(p => ({...p, cameraMovement: e.target.value}))} options={CAMERA_MOVEMENTS} />
            <SelectControl value={formState.cameraAngle} onChange={e => setFormState(p => ({...p, cameraAngle: e.target.value}))} options={CAMERA_ANGLES} />
            <SelectControl value={formState.cameraFocus} onChange={e => setFormState(p => ({...p, cameraFocus: e.target.value}))} options={CAMERA_FOCUS} />
          </FormControl>

          <FormControl label="Soundscape">
            <SelectControl label="Primary" value={formState.soundscapePrimary} onChange={e => setFormState(p => ({...p, soundscapePrimary: e.target.value}))} options={PRIMARY_SOUNDS} />
            <MultiSelectGroup label="Secondary" items={SECONDARY_SOUNDS} selectedItems={formState.soundscapeSecondary} onToggle={(item) => toggleMultiSelect(item, 'soundscapeSecondary')} />
             <SelectControl label="Quality" value={formState.soundscapeQuality} onChange={e => setFormState(p => ({...p, soundscapeQuality: e.target.value}))} options={SOUND_QUALITIES} />
          </FormControl>

          <FormControl label="Visual Effects">
            <MultiSelectGroup items={VISUAL_EFFECTS} selectedItems={formState.visualEffects} onToggle={(item) => toggleMultiSelect(item, 'visualEffects')} />
          </FormControl>

          <div className="action-buttons">
            <button className="button primary" onClick={handleGenerateJson}>
              <span className="icon">auto_awesome</span> Generate JSON
            </button>
            <button className="button secondary" onClick={handleReset}>
              <span className="icon">refresh</span> Reset
            </button>
          </div>
        </section>

        <section className="output-panel">
          <div className="output-area">
             <div className="output-header">
              <h3>Generated JSON</h3>
              <div className="output-actions">
                 {generatedJson && (
                   <>
                    <button className="button secondary" onClick={handleCopyJson} disabled={copyButtonText === 'Copied!'}>
                      <span className="icon">content_copy</span> {copyButtonText}
                    </button>
                    <button className="button secondary" onClick={handleDownloadJson}>
                      <span className="icon">download</span> Download
                    </button>
                   </>
                 )}
              </div>
            </div>
            <div className="json-preview">
              {generatedJson ? (
                <SyntaxHighlighter language="json" style={effectiveTheme === 'light' ? atomOneLight : atomOneDark} customStyle={{ height: '100%' }}>
                  {generatedJson}
                </SyntaxHighlighter>
              ) : (
                <div className="placeholder">
                  <p>Your generated JSON will appear here.</p>
                </div>
              )}
            </div>
          </div>
           {generatedJson && (
            <div className="action-buttons">
              <button className="button secondary" onClick={handleSelfTest}>
                <span className="icon">science</span> Run Self-Test
              </button>
              <div className={`validation-status ${validationStatus}`}>
                {validationStatus === 'valid' && <><span className="icon">check_circle</span> Schema valid</>}
                {validationStatus === 'invalid' && <><span className="icon">error</span> Schema invalid</>}
                {validationStatus === 'unchecked' && <><span className="icon">help</span> Not checked</>}
              </div>
            </div>
           )}
        </section>
      </main>
    </div>
  );
}