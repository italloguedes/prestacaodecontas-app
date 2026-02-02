import { motion } from 'framer-motion';
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
                    {files.map((file, index) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <FileCard file={file} onRemove={() => removeFile(file.id)} />
                        </motion.div>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function FileCard({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
    return (
        <SortableItem id={file.id}>
            <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg transition-all hover:border-primary/30 hover:shadow-glow">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1.5 text-white/70 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/80 hover:text-white group-hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </motion.button>

                <div className="flex h-full w-full flex-col items-center justify-center p-2">
                    {file.type === 'image' ? (
                        <img
                            src={file.preview}
                            alt={file.name}
                            className="h-full w-full object-cover rounded-lg"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-white/40">
                            <div className="rounded-xl bg-white/10 p-4">
                                <FileText className="h-10 w-10" />
                            </div>
                            <span className="px-2 text-center text-xs font-medium text-white/60 line-clamp-2">
                                {file.name}
                            </span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs text-white/90">{file.name}</p>
                </div>

                {/* Index badge */}
                <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/80 text-xs font-bold text-white backdrop-blur-sm">
                    {file.id.slice(-2)}
                </div>
            </div>
        </SortableItem>
    );
}
