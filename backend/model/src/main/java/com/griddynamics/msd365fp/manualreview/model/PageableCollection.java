package com.griddynamics.msd365fp.manualreview.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import org.springframework.lang.NonNull;

import java.util.Collection;
import java.util.Iterator;

@Getter
@JsonPropertyOrder({"continuationToken", "size", "empty", "values"})
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public class PageableCollection<T> implements Collection<T> {
    private final String continuationToken;
    private final Collection<T> values;

    public PageableCollection(@NonNull final Collection<T> data, final String continuation) {
        this.continuationToken = continuation;
        this.values = data;
    }

    @JsonProperty(required = true)
    public int getSize() {
        return size();
    }

    @Override
    public int size() {
        return values.size();
    }

    @Override
    @JsonProperty(required = true)
    public boolean isEmpty() {
        return values.isEmpty();
    }

    @Override
    public boolean contains(final Object o) {
        return values.contains(o);
    }

    @Override
    @NonNull
    public Iterator<T> iterator() {
        return values.iterator();
    }

    @Override
    @NonNull
    public Object[] toArray() {
        return values.toArray();
    }

    @Override
    @NonNull
    public <T1> T1[] toArray(@NonNull final T1[] a) {
        return values.toArray(a);
    }

    @Override
    public boolean add(final T t) {
        return values.add(t);
    }

    @Override
    public boolean remove(final Object o) {
        return values.remove(o);
    }

    @Override
    public boolean containsAll(@NonNull final Collection<?> c) {
        return values.containsAll(c);
    }

    @Override
    public boolean addAll(@NonNull final Collection<? extends T> c) {
        return values.addAll(c);
    }

    @Override
    public boolean removeAll(@NonNull final Collection<?> c) {
        return values.removeAll(c);
    }

    @Override
    public boolean retainAll(@NonNull final Collection<?> c) {
        return values.retainAll(c);
    }

    @Override
    public void clear() {
        values.clear();
    }
}
