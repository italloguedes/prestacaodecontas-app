import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useFileStore, type UploadedFile } from '../store/useFileStore';
import { SortableItem } from './SortableItem';
import { X, FileText } from 'lucide-react';

export function FileList() {
    const { files, removeFile, reorderFiles } = useFileStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = files.findIndex((f) => f.id === active.id);
            const newIndex = files.findIndex((f) => f.id === over.id);
            reorderFiles(arrayMove(files, oldIndex, newIndex));
        }
    }

    if (files.length === 0) return null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={files} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {files.map((file) => (
                        <FileCard key={file.id} file={file} onRemove={() => removeFile(file.id)} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function FileCard({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
    return (
        <SortableItem id={file.id}>
            <div className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1.5 text-slate-500 opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex h-full w-full flex-col items-center justify-center p-2">
                    {file.type === 'image' ? (
                        <img
                            src={file.preview}
                            alt={file.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                            <FileText className="h-12 w-12" />
                            <span className="px-2 text-center text-xs font-medium text-slate-600 line-clamp-2">
                                {file.name}
                            </span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs text-white">{file.name}</p>
                </div>
            </div>
        </SortableItem>
    );
}
