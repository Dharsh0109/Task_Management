import { FolderKanban, Menu, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProjectSidebar = ({ projects, activeProjectId, onSelectProject, onCreateProject }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateScreen = () => setIsMobile(window.innerWidth < 768);
    updateScreen();
    window.addEventListener('resize', updateScreen);
    return () => window.removeEventListener('resize', updateScreen);
  }, []);

  const content = (
    <aside className="rounded-md border border-border bg-surface p-4 md:h-fit md:w-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderKanban size={16} className="text-primary" />
          <h2 className="font-display text-lg font-semibold text-text-primary">Projects</h2>
        </div>
        {isMobile ? (
          <button onClick={() => setIsOpen(false)} className="rounded-md p-1 text-text-secondary">
            <X size={16} />
          </button>
        ) : (
          <button onClick={onCreateProject} className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-white hover:bg-primary-hover">
            <Plus size={14} />
            Add project
          </button>
        )}
      </div>
      {isMobile ? (
        <button onClick={onCreateProject} className="mb-3 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-white hover:bg-primary-hover">
          <Plus size={14} />
          Add project
        </button>
      ) : null}
      <div className="space-y-2">
        {projects.length === 0 ? <p className="text-sm text-text-secondary">Create a project to organize new tasks.</p> : null}
        {projects.map((project) => (
          <button
            key={project._id}
            onClick={() => {
              onSelectProject(project._id);
              if (isMobile) setIsOpen(false);
            }}
            className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
              activeProjectId === project._id
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text-primary hover:bg-surface-alt'
            }`}
          >
            {project.name}
          </button>
        ))}
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        <button onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary">
          <Menu size={16} />
          Projects
        </button>
        {isOpen ? <div className="fixed inset-0 z-20 bg-black/20" onClick={() => setIsOpen(false)} /> : null}
        <div className={`fixed left-0 top-0 z-30 h-full w-72 max-w-[85vw] p-4 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {content}
        </div>
      </>
    );
  }

  return content;
};

export default ProjectSidebar;
